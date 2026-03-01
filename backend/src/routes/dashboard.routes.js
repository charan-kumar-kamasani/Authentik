const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Scan = require('../models/Scan');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Company = require('../models/Company');
const Brand = require('../models/Brand');
const User = require('../models/User');
const Report = require('../models/Report');

// ─── Reverse Geocoding helper (Nominatim + native fetch) ───
async function reverseGeocode(lat, lng) {
  if (!lat || !lng) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'User-Agent': 'Authentik-Dashboard/1.0 (contact@authentik.com)' } }
    );
    const data = await res.json();
    const city  = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
    const state = data.address?.state || '';
    const parts = [city, state].filter(Boolean).join(', ');
    return parts || null;
  } catch { return null; }
}

// Resolve "Unknown location" entries & update DB in background
async function resolveUnknownPlaces(results, keyField = '_id') {
  const resolved = [];
  for (const r of results) {
    const place = r[keyField] || r.place;
    if ((!place || place === 'Unknown location' || place === 'Unknown') && r.lat && r.lng) {
      const city = await reverseGeocode(r.lat, r.lng);
      if (city) {
        // Update DB in background (don't await)
        Scan.updateMany(
          { latitude: r.lat, longitude: r.lng, $or: [{ place: null }, { place: '' }, { place: 'Unknown location' }, { place: 'Unknown' }] },
          { $set: { place: city } }
        ).exec().catch(() => {});

        resolved.push({ ...r, [keyField]: city, place: city });
      } else {
        resolved.push(r);
      }
    } else {
      resolved.push(r);
    }
  }
  // Merge entries with the same resolved city name
  const merged = new Map();
  for (const r of resolved) {
    const key = r[keyField] || r.place || 'Unknown';
    if (merged.has(key)) {
      const m = merged.get(key);
      m.total      = (m.total || 0) + (r.total || 0);
      m.authentic  = (m.authentic || 0) + (r.authentic || 0);
      m.suspicious = (m.suspicious || 0) + (r.suspicious || 0);
      m.duplicate  = (m.duplicate || 0) + (r.duplicate || 0);
      if (r.fake != null) m.fake = (m.fake || 0) + (r.fake || 0);
      if (r.anomalyScore != null) m.anomalyScore = (m.anomalyScore || 0) + (r.anomalyScore || 0);
    } else {
      merged.set(key, { ...r });
    }
  }
  return Array.from(merged.values());
}

// ─── Helper: build base filter by role ───
async function buildScopeFilter(user) {
  const filter = {};
  if (['superadmin', 'admin'].includes(user.role)) {
    // Full access — no filter
    return filter;
  }
  // company / authorizer / creator — scoped to their company's brands
  if (user.companyId) {
    const brands = await Brand.find({ companyId: user.companyId }).select('_id');
    filter.brandId = { $in: brands.map(b => b._id) };
  } else if (user.brandId) {
    filter.brandId = user.brandId;
  }
  return filter;
}

// ─── GET /dashboard/stats — Main dashboard statistics ───
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const scope = await buildScopeFilter(user);

    // Core counts
    const [totalScans, authenticScans, suspiciousScans, duplicateAlerts] = await Promise.all([
      Scan.countDocuments(scope),
      Scan.countDocuments({ ...scope, status: 'ORIGINAL' }),
      Scan.countDocuments({ ...scope, status: 'FAKE' }),
      Scan.countDocuments({ ...scope, status: 'ALREADY_USED' }),
    ]);

    // Additional counts
    const [totalProducts, activeProducts, totalOrders, totalReports] = await Promise.all([
      Product.countDocuments(scope.brandId ? { brandId: scope.brandId } : {}),
      Product.countDocuments(scope.brandId ? { brandId: scope.brandId, isActive: true } : { isActive: true }),
      Order.countDocuments(scope.brandId ? { brandId: scope.brandId } : {}),
      Report.countDocuments({}),
    ]);

    // Companies + brands (superadmin only)
    let totalCompanies = 0;
    let totalBrands = 0;
    if (['superadmin', 'admin'].includes(user.role)) {
      [totalCompanies, totalBrands] = await Promise.all([
        Company.countDocuments({}),
        Brand.countDocuments({}),
      ]);
    }

    res.json({
      totalScans,
      authenticScans,
      suspiciousScans,
      duplicateAlerts,
      totalProducts,
      activeProducts,
      totalOrders,
      totalReports,
      totalCompanies,
      totalBrands,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /dashboard/scan-trend — Scan trend over time (bar chart) ───
router.get('/scan-trend', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const scope = await buildScopeFilter(user);
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline = [
      { $match: { ...scope, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ];

    const results = await Scan.aggregate(pipeline);

    // Organize by date
    const dateMap = {};
    results.forEach(r => {
      const d = r._id.date;
      if (!dateMap[d]) dateMap[d] = { date: d, authentic: 0, suspicious: 0, duplicate: 0, total: 0 };
      if (r._id.status === 'ORIGINAL') dateMap[d].authentic += r.count;
      else if (r._id.status === 'FAKE') dateMap[d].suspicious += r.count;
      else if (r._id.status === 'ALREADY_USED') dateMap[d].duplicate += r.count;
      dateMap[d].total += r.count;
    });

    // Fill missing dates
    const trend = [];
    const current = new Date(startDate);
    const now = new Date();
    while (current <= now) {
      const dateStr = current.toISOString().split('T')[0];
      trend.push(dateMap[dateStr] || { date: dateStr, authentic: 0, suspicious: 0, duplicate: 0, total: 0 });
      current.setDate(current.getDate() + 1);
    }

    res.json(trend);
  } catch (error) {
    console.error('Scan trend error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /dashboard/duplicate-trend — Already-scanned alerts trend ───
router.get('/duplicate-trend', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const scope = await buildScopeFilter(user);
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline = [
      { $match: { ...scope, status: 'ALREADY_USED', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const results = await Scan.aggregate(pipeline);
    const dateMap = {};
    results.forEach(r => { dateMap[r._id] = r.count; });

    const trend = [];
    const current = new Date(startDate);
    const now = new Date();
    while (current <= now) {
      const dateStr = current.toISOString().split('T')[0];
      trend.push({ date: dateStr, count: dateMap[dateStr] || 0 });
      current.setDate(current.getDate() + 1);
    }

    res.json(trend);
  } catch (error) {
    console.error('Duplicate trend error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /dashboard/high-risk-skus — Top SKUs by suspicious scan ratio ───
router.get('/high-risk-skus', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const scope = await buildScopeFilter(user);
    const limit = parseInt(req.query.limit) || 5;

    const pipeline = [
      { $match: scope },
      {
        $group: {
          _id: '$productName',
          total: { $sum: 1 },
          fake: { $sum: { $cond: [{ $eq: ['$status', 'FAKE'] }, 1, 0] } },
          duplicate: { $sum: { $cond: [{ $eq: ['$status', 'ALREADY_USED'] }, 1, 0] } },
        },
      },
      { $addFields: { riskCount: { $add: ['$fake', '$duplicate'] } } },
      { $addFields: { riskPercent: { $cond: [{ $gt: ['$total', 0] }, { $multiply: [{ $divide: ['$riskCount', '$total'] }, 100] }, 0] } } },
      { $sort: { riskPercent: -1 } },
      { $limit: limit },
    ];

    const results = await Scan.aggregate(pipeline);
    res.json(results.map(r => ({
      productName: r._id || 'Unknown',
      total: r.total,
      fake: r.fake,
      duplicate: r.duplicate,
      riskPercent: Math.round(r.riskPercent),
    })));
  } catch (error) {
    console.error('High risk SKUs error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /dashboard/batch-risk — Batch risk analysis ───
router.get('/batch-risk', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const scope = await buildScopeFilter(user);
    const limit = parseInt(req.query.limit) || 10;

    // Aggregate scans by matching product's batchNo
    const pipeline = [
      { $match: scope },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { batchNo: '$product.batchNo', brand: '$product.brand' },
          total: { $sum: 1 },
          fake: { $sum: { $cond: [{ $eq: ['$status', 'FAKE'] }, 1, 0] } },
          duplicate: { $sum: { $cond: [{ $eq: ['$status', 'ALREADY_USED'] }, 1, 0] } },
          places: { $addToSet: '$place' },
        },
      },
      { $addFields: { riskCount: { $add: ['$fake', '$duplicate'] } } },
      { $addFields: { riskPercent: { $cond: [{ $gt: ['$total', 0] }, { $multiply: [{ $divide: ['$riskCount', '$total'] }, 100] }, 0] } } },
      { $match: { '_id.batchNo': { $ne: null } } },
      { $sort: { riskPercent: -1 } },
      { $limit: limit },
    ];

    const results = await Scan.aggregate(pipeline);
    res.json(results.map(r => ({
      batchNo: r._id.batchNo || 'N/A',
      brand: r._id.brand || 'Unknown',
      total: r.total,
      riskPercent: Math.round(r.riskPercent),
      region: (r.places || []).filter(Boolean).join(', ') || 'N/A',
    })));
  } catch (error) {
    console.error('Batch risk error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /dashboard/geo-data — Scan location data for geo intelligence ───
router.get('/geo-data', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const scope = await buildScopeFilter(user);

    const pipeline = [
      { $match: {
        ...scope,
        $or: [
          { place: { $ne: null, $ne: '' } },
          { latitude: { $ne: null }, longitude: { $ne: null } },
        ],
      }},
      // Normalize null/empty place to 'Unknown location' so we can group & resolve
      { $addFields: {
        normalizedPlace: {
          $cond: {
            if: { $and: [{ $ne: ['$place', null] }, { $ne: ['$place', ''] }] },
            then: '$place',
            else: 'Unknown location',
          },
        },
      }},
      {
        $group: {
          _id: '$normalizedPlace',
          total: { $sum: 1 },
          authentic: { $sum: { $cond: [{ $eq: ['$status', 'ORIGINAL'] }, 1, 0] } },
          suspicious: { $sum: { $cond: [{ $eq: ['$status', 'FAKE'] }, 1, 0] } },
          duplicate: { $sum: { $cond: [{ $eq: ['$status', 'ALREADY_USED'] }, 1, 0] } },
          lat: { $first: '$latitude' },
          lng: { $first: '$longitude' },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 50 },
    ];

    const results = await Scan.aggregate(pipeline);
    const mapped = results.map(r => ({
      _id: r._id,
      place: r._id,
      total: r.total,
      authentic: r.authentic,
      suspicious: r.suspicious,
      duplicate: r.duplicate,
      lat: r.lat,
      lng: r.lng,
    }));

    // Resolve "Unknown location" entries to real city names
    const resolved = await resolveUnknownPlaces(mapped);
    // Re-sort by total desc after merge
    resolved.sort((a, b) => b.total - a.total);
    res.json(resolved.map(({ _id, ...rest }) => rest));
  } catch (error) {
    console.error('Geo data error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /dashboard/geo-markers — Individual scan coordinates for map markers ───
router.get('/geo-markers', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const scope = await buildScopeFilter(user);
    const limit = parseInt(req.query.limit) || 200;

    const scans = await Scan.find({
      ...scope,
      latitude: { $ne: null },
      longitude: { $ne: null },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('status place latitude longitude productName brand createdAt')
      .lean();

    // Resolve unknown places for markers too (batch unique unknown coords)
    const unknownCoords = new Map();
    for (const s of scans) {
      if ((!s.place || s.place === 'Unknown location' || s.place === 'Unknown') && s.latitude && s.longitude) {
        const key = `${s.latitude.toFixed(2)},${s.longitude.toFixed(2)}`;
        if (!unknownCoords.has(key)) unknownCoords.set(key, { lat: s.latitude, lng: s.longitude });
      }
    }
    // Reverse geocode unique unknown locations (max 10 to stay fast)
    const geoCache = new Map();
    let count = 0;
    for (const [key, { lat, lng }] of unknownCoords) {
      if (count >= 10) break;
      const city = await reverseGeocode(lat, lng);
      if (city) {
        geoCache.set(key, city);
        // Also fix DB in background
        Scan.updateMany(
          { latitude: lat, longitude: lng, $or: [{ place: null }, { place: '' }, { place: 'Unknown location' }, { place: 'Unknown' }] },
          { $set: { place: city } }
        ).exec().catch(() => {});
      }
      count++;
    }

    res.json(scans.map(s => {
      let place = s.place;
      if (!place || place === 'Unknown location' || place === 'Unknown') {
        const key = s.latitude && s.longitude ? `${s.latitude.toFixed(2)},${s.longitude.toFixed(2)}` : null;
        place = (key && geoCache.get(key)) || place || 'Unknown';
      }
      return {
        lat: s.latitude,
        lng: s.longitude,
        status: s.status,
        place,
        productName: s.productName || 'Unknown',
        brand: s.brand || 'Unknown',
        createdAt: s.createdAt,
      };
    }));
  } catch (error) {
    console.error('Geo markers error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /dashboard/geo-anomalies — Distributor anomalies (scans far from expected) ───
router.get('/geo-anomalies', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const scope = await buildScopeFilter(user);

    // Group by place and find places with high suspicious/duplicate ratios
    const pipeline = [
      { $match: {
        ...scope,
        $or: [
          { place: { $ne: null, $ne: '' } },
          { latitude: { $ne: null }, longitude: { $ne: null } },
        ],
      }},
      { $addFields: {
        normalizedPlace: {
          $cond: {
            if: { $and: [{ $ne: ['$place', null] }, { $ne: ['$place', ''] }] },
            then: '$place',
            else: 'Unknown location',
          },
        },
      }},
      {
        $group: {
          _id: '$normalizedPlace',
          total: { $sum: 1 },
          fake: { $sum: { $cond: [{ $eq: ['$status', 'FAKE'] }, 1, 0] } },
          duplicate: { $sum: { $cond: [{ $eq: ['$status', 'ALREADY_USED'] }, 1, 0] } },
          authentic: { $sum: { $cond: [{ $eq: ['$status', 'ORIGINAL'] }, 1, 0] } },
          lat: { $first: '$latitude' },
          lng: { $first: '$longitude' },
        },
      },
      { $addFields: { anomalyScore: { $add: ['$fake', '$duplicate'] } } },
      { $match: { anomalyScore: { $gt: 0 } } },
      { $sort: { anomalyScore: -1 } },
      { $limit: 15 },
    ];

    const results = await Scan.aggregate(pipeline);
    const mapped = results.map(r => ({
      _id: r._id,
      place: r._id,
      total: r.total,
      fake: r.fake,
      duplicate: r.duplicate,
      authentic: r.authentic,
      anomalyScore: r.anomalyScore,
      lat: r.lat,
      lng: r.lng,
    }));
    const resolved = await resolveUnknownPlaces(mapped);
    resolved.sort((a, b) => b.anomalyScore - a.anomalyScore);
    res.json(resolved.map(({ _id, ...rest }) => rest));
  } catch (error) {
    console.error('Geo anomalies error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /dashboard/product-performance — Product / SKU performance data ───
router.get('/product-performance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const scope = await buildScopeFilter(user);
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Top scanned SKUs
    const skuPipeline = [
      { $match: { ...scope, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$productName',
          total: { $sum: 1 },
          authentic: { $sum: { $cond: [{ $eq: ['$status', 'ORIGINAL'] }, 1, 0] } },
          suspicious: { $sum: { $cond: [{ $eq: ['$status', 'FAKE'] }, 1, 0] } },
          duplicate: { $sum: { $cond: [{ $eq: ['$status', 'ALREADY_USED'] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ];

    // Batch movement — scans over time grouped by batch
    const batchPipeline = [
      { $match: { ...scope, createdAt: { $gte: startDate } } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            batchNo: '$product.batchNo',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          },
          count: { $sum: 1 },
        },
      },
      { $match: { '_id.batchNo': { $ne: null } } },
      { $sort: { '_id.date': 1 } },
    ];

    // Avg time from production to first scan (batch velocity)
    const velocityPipeline = [
      { $match: scope.brandId ? { brandId: scope.brandId } : {} },
      {
        $lookup: {
          from: 'scans',
          localField: '_id',
          foreignField: 'productId',
          as: 'scans',
        },
      },
      { $match: { 'scans.0': { $exists: true } } },
      {
        $project: {
          productName: 1,
          batchNo: 1,
          manufactureDate: 1,
          firstScan: { $min: '$scans.createdAt' },
        },
      },
      { $match: { manufactureDate: { $ne: null }, firstScan: { $ne: null } } },
      { $limit: 100 },
    ];

    const [skuData, batchData, velocityData] = await Promise.all([
      Scan.aggregate(skuPipeline),
      Scan.aggregate(batchPipeline),
      Product.aggregate(velocityPipeline),
    ]);

    // Calculate average velocity in days
    let avgVelocityDays = 0;
    if (velocityData.length > 0) {
      const totalDays = velocityData.reduce((sum, p) => {
        const mfg = new Date(p.manufactureDate);
        const first = new Date(p.firstScan);
        if (isNaN(mfg.getTime()) || isNaN(first.getTime())) return sum;
        return sum + Math.max(0, (first - mfg) / (1000 * 60 * 60 * 24));
      }, 0);
      avgVelocityDays = Math.round(totalDays / velocityData.length);
    }

    // Top SKU
    const topSku = skuData[0] || { _id: 'N/A', total: 0 };

    // Organize batch movement by batch
    const batchMap = {};
    batchData.forEach(b => {
      const batch = b._id.batchNo || 'Unknown';
      if (!batchMap[batch]) batchMap[batch] = [];
      batchMap[batch].push({ date: b._id.date, count: b.count });
    });
    const topBatches = Object.entries(batchMap)
      .sort((a, b) => b[1].reduce((s, x) => s + x.count, 0) - a[1].reduce((s, x) => s + x.count, 0))
      .slice(0, 5)
      .map(([batch, data]) => ({ batch, data }));

    res.json({
      topSku: topSku._id || 'N/A',
      topSkuScans: topSku.total,
      avgBatchVelocity: avgVelocityDays,
      skuPerformance: skuData.map(s => ({
        name: s._id || 'Unknown',
        total: s.total,
        authentic: s.authentic,
        suspicious: s.suspicious,
        duplicate: s.duplicate,
      })),
      batchMovement: topBatches,
    });
  } catch (error) {
    console.error('Product performance error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /dashboard/recent-activity — Recent scans feed ───
router.get('/recent-activity', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const scope = await buildScopeFilter(user);
    const limit = parseInt(req.query.limit) || 10;

    const scans = await Scan.find(scope)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name mobile city state')
      .populate('brandId', 'brandName')
      .lean();

    res.json(scans.map(s => ({
      _id: s._id,
      status: s.status,
      productName: s.productName || 'Unknown',
      brand: s.brandId?.brandName || s.brand || 'Unknown',
      place: s.place || 'N/A',
      user: s.userId?.name || s.userId?.mobile || 'Anonymous',
      createdAt: s.createdAt,
    })));
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /dashboard/consumer-insights — Demographics of scanning users ───
router.get('/consumer-insights', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const scope = await buildScopeFilter(user);

    // Get unique user IDs who scanned
    const scannerIds = await Scan.distinct('userId', scope);

    // Repeat users (scanned more than once)
    const repeatPipeline = [
      { $match: scope },
      { $group: { _id: '$userId', scanCount: { $sum: 1 } } },
      { $match: { scanCount: { $gt: 1 } } },
      { $count: 'repeatUsers' },
    ];
    const repeatResult = await Scan.aggregate(repeatPipeline);
    const repeatUsers = repeatResult[0]?.repeatUsers || 0;

    // Engagement rate
    const totalUsers = await User.countDocuments({ role: 'user' });
    const engagementRate = totalUsers > 0 ? Math.round((scannerIds.length / totalUsers) * 100) : 0;

    // Demographics
    const [ageGroups, genders, cities] = await Promise.all([
      User.aggregate([
        { $match: { _id: { $in: scannerIds }, ageGroup: { $ne: null } } },
        { $group: { _id: '$ageGroup', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        { $match: { _id: { $in: scannerIds }, gender: { $ne: null } } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        { $match: { _id: { $in: scannerIds }, city: { $ne: null } } },
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    // Age + Gender cross (for grouped bar)
    const ageGenderPipeline = [
      { $match: { _id: { $in: scannerIds }, ageGroup: { $ne: null }, gender: { $ne: null } } },
      { $group: { _id: { ageGroup: '$ageGroup', gender: '$gender' }, count: { $sum: 1 } } },
      { $sort: { '_id.ageGroup': 1 } },
    ];
    const ageGenderRaw = await User.aggregate(ageGenderPipeline);
    const ageGenderMap = {};
    ageGenderRaw.forEach(r => {
      const ag = r._id.ageGroup;
      if (!ageGenderMap[ag]) ageGenderMap[ag] = { label: ag };
      ageGenderMap[ag][r._id.gender] = r.count;
    });
    const ageGenderBreakdown = Object.values(ageGenderMap);

    // States (for top regions)
    const states = await User.aggregate([
      { $match: { _id: { $in: scannerIds }, state: { $ne: null } } },
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      totalConsumers: scannerIds.length,
      repeatUsers,
      engagementRate,
      totalAppUsers: totalUsers,
      ageGroups: ageGroups.map(a => ({ label: a._id, count: a.count })),
      genders: genders.map(g => ({ label: g._id, count: g.count })),
      topCities: cities.map(c => ({ label: c._id, count: c.count })),
      topStates: states.map(s => ({ label: s._id, count: s.count })),
      ageGenderBreakdown,
    });
  } catch (error) {
    console.error('Consumer insights error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
