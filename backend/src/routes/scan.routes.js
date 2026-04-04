const express = require("express");
const Product = require("../models/Product");
const Scan = require("../models/Scan");
const Report = require("../models/Report");
const User = require("../models/User");
const FormConfig = require("../models/FormConfig");
const Review = require("../models/Review");
const ProductCoupon = require("../models/ProductCoupon");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const placeCache = new Map(); // Simple in-memory cache for coordinates

// helper for reverse geocoding (using native fetch — Node 18+)
async function getPlaceFromCoords(lat, lon) {
  if (!lat || !lon) return "Unknown location";
  
  const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  if (placeCache.has(key)) return placeCache.get(key);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "Authentik/1.0 (contact@authentik.com)",
        },
        // Set a short timeout for the external API
        signal: AbortSignal.timeout(1500)
      }
    );

    const data = await res.json();
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
    const state = data.address?.state || "";
    const result = [city, state].filter(Boolean).join(", ") || "Unknown location";
    
    if (result !== "Unknown location") {
      placeCache.set(key, result);
    }
    return result;
  } catch {
    return "Unknown location";
  }
}

// Get scan statistics for the current user
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalScans = await Scan.countDocuments({ userId });
    const originalScans = await Scan.countDocuments({ userId, status: "ORIGINAL" });
    const fakeScans = await Scan.countDocuments({ userId, status: "FAKE" });
    const duplicateScans = await Scan.countDocuments({
      userId,
      $or: [{ status: "ALREADY_USED" }, { status: "DUPLICATE" }],
    });

    res.json({
      totalScans,
      authentiks: originalScans,
      counterfeit: fakeScans,
      alert: duplicateScans,
    });
  } catch (err) {
    console.error("Error fetching scan stats:", err);
    res.status(500).json({ error: "Failed to fetch scan stats" });
  }
});

router.get("/history", protect, async (req, res) => {
  try {
    let scans = await Scan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("productId")
      .populate({ path: "brandId", populate: { path: "companyId" } })
      .lean();

    // For any ALREADY_USED scans, include the original scan details (scannedBy, scannedAt, place)
    scans = await Promise.all(
      scans.map(async (s) => {
        const obj = s.toObject ? s.toObject() : s;
        
        // Inject companyName from populated brandId so frontend picks it up automatically
        if (obj.brandId && obj.brandId.companyId) {
          obj.companyName = obj.brandId.companyId.companyName || obj.brandId.companyId.name;
        }

        if (obj.status === 'ALREADY_USED' && obj.productId) {
          try {
            const original = await Scan.findOne({ productId: obj.productId._id, status: 'ORIGINAL' }).populate('userId', 'mobile');
            if (original) {
              // Mask mobile
              let masked = 'Unknown';
              if (original.userId && original.userId.mobile) {
                const m = original.userId.mobile.toString();
                masked = m.length > 2 ? m.slice(0, 3) + '*'.repeat(m.length - 3) + m.slice(-4) : m;
              }
              obj.originalScan = {
                scannedBy: masked,
                scannedAt: original.createdAt,
                place: original.place,
              };
            }
          } catch (e) {
            console.warn('Failed to fetch original scan for history item', e);
          }
        }
        return obj;
      })
    );

    res.json(scans);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch scan history" });
  }
});

// Lightweight check endpoint so clients can verify QR existence and active state
router.post("/check", async (req, res) => {
  try {
    const { qrCode } = req.body;
console.log(qrCode)
    if (!qrCode) {
      return res.status(400).json({ error: "qrCode required" });
    }

    const product = await Product.findOne({ qrCode })
      .populate('orderId')
      .populate({ path: 'brandId', populate: { path: 'companyId' } })
      .lean();
 
    // Fetch field labels from global config (cached in model if using getGlobalFormConfig correctly)
    const config = await FormConfig.getGlobalFormConfig();
    const fieldLabels = {};
    if (config && config.customFields) {
      config.customFields.forEach(f => {
        fieldLabels[f.fieldName] = f.fieldLabel;
      });
    }

    // Check if user has already reviewed
    let alreadyReviewed = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET');
        const review = await Review.findOne({ productId: product._id, userId: decoded.userId });
        if (review) alreadyReviewed = true;
      } catch (e) {
        // Token invalid, ignore
      }
    }

    if (!product) {
      return res.json({ status: "FAKE", isActive: false, product: null });
    }

    // If product exists but is inactive, return INACTIVE status with product details for UI context
    if (!product.isActive) {
      return res.json({ 
        status: "INACTIVE", 
        isActive: false, 
        message: "This QR code is inactive.",
        product: {
          productId: product._id,
          productName: product.productName || product.orderId?.productName,
          companyName: product.brandId?.companyId?.companyName || null,
          brand: product.brand || product.orderId?.brand,
          batchNo: product.batchNo || product.orderId?.batchNo,
          productImage: product.productImage || product.orderId?.productImage,
          category: product.category || product.orderId?.category,
          mrp: product.mrp || product.orderId?.mrp,
          manufacturedBy: product.manufacturedBy || product.orderId?.manufacturedBy,
          marketedBy: product.marketedBy || product.orderId?.marketedBy,
          importMarketedBy: product.importMarketedBy || product.orderId?.importMarketedBy,
          importerRegNo: product.importerRegNo || product.orderId?.importerRegNo,
          countryOfOrigin: product.countryOfOrigin || product.orderId?.countryOfOrigin,
          website: product.website || product.orderId?.website,
          supportEmail: product.supportEmail || product.orderId?.supportEmail,
          customerCare: product.customerCare || product.orderId?.customerCare,
          keyBenefits: product.keyBenefits || product.orderId?.keyBenefits,
          mfdOn: (product.mfdOn?.month) ? product.mfdOn : product.orderId?.mfdOn,
          description: product.description || product.orderId?.description,
          productInfo: product.productInfo || product.orderId?.productInfo,
          bestBefore: (product.bestBefore?.value) ? product.bestBefore : product.orderId?.bestBefore,
          calculatedExpiryDate: product.calculatedExpiryDate || product.orderId?.calculatedExpiryDate,
          dynamicFields: (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : product.orderId?.dynamicFields,
          variants: (product.variants && product.variants.length > 0) ? product.variants : product.orderId?.variants,
          fieldLabels,
          alreadyReviewed,
        }
      });
    }

    return res.json({
      status: "FOUND",
      isActive: !!product.isActive,
      product: {
        productId: product._id,
        productName: product.productName,
        companyName: product.brandId?.companyId?.companyName || null,
        brand: product.brand,
        batchNo: product.batchNo,
        productImage: product.productImage || product.orderId?.productImage,
        category: product.category || product.orderId?.category,
        mrp: product.mrp || product.orderId?.mrp,
        manufacturedBy: product.manufacturedBy || product.orderId?.manufacturedBy,
        marketedBy: product.marketedBy || product.orderId?.marketedBy,
        importMarketedBy: product.importMarketedBy || product.orderId?.importMarketedBy,
        importerRegNo: product.importerRegNo || product.orderId?.importerRegNo,
        countryOfOrigin: product.countryOfOrigin || product.orderId?.countryOfOrigin,
        website: product.website || product.orderId?.website,
        supportEmail: product.supportEmail || product.orderId?.supportEmail,
        customerCare: product.customerCare || product.orderId?.customerCare,
        keyBenefits: product.keyBenefits || product.orderId?.keyBenefits,
        mfdOn: (product.mfdOn?.month) ? product.mfdOn : product.orderId?.mfdOn,
        description: product.description || product.orderId?.description,
        productInfo: product.productInfo || product.orderId?.productInfo,
        bestBefore: (product.bestBefore?.value) ? product.bestBefore : product.orderId?.bestBefore,
        calculatedExpiryDate: product.calculatedExpiryDate || product.orderId?.calculatedExpiryDate,
        dynamicFields: (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : product.orderId?.dynamicFields,
        variants: (product.variants && product.variants.length > 0) ? product.variants : product.orderId?.variants,
        fieldLabels,
        alreadyReviewed,
      },
    });
  } catch (err) {
    console.error("/scan/check error:", err);
    res.status(500).json({ error: "Check failed" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { qrCode, latitude, longitude } = req.body;
    console.log("Scan POST body:", { qrCode, latitude, longitude });

    if (!qrCode) {
      return res.status(400).json({ error: "qrCode is required for scanning." });
    }

    // --- BRAND RESOLUTION (Guess from QR prefix even if product not found) ---
    let brandIdFromPrefix = null;
    let brandNameFromPrefix = null;

    const qrParts = qrCode.split('-');
    if (qrParts.length > 1) {
      const guessedBrand = qrParts[0];
      const Brand = require("../models/Brand");
      const foundBrand = await Brand.findOne({ 
        brandName: { $regex: new RegExp(`^${guessedBrand}$`, "i") } 
      });
      if (foundBrand) {
        brandIdFromPrefix = foundBrand._id;
        brandNameFromPrefix = foundBrand.brandName;
      }
    }

    const place = await getPlaceFromCoords(latitude, longitude);
    const scannedAt = new Date();

    // 1️⃣ Check product
    const product = await Product.findOne({ qrCode })
      .populate('orderId')
      .populate({ path: 'brandId', populate: { path: 'companyId' } })
      .lean();

    // Check if user has already reviewed
    let alreadyReviewed = false;
    // We already have req.user from protect middleware
    const review = await Review.findOne({ productId: product?._id, userId: req.user._id }).lean();
    if (review) alreadyReviewed = true;

    // Field Labels for dynamic fields
    const fieldLabels = {};
    if (product?.brandId?.dynamicFields) {
      product.brandId.dynamicFields.forEach(f => {
        fieldLabels[f.fieldName] = f.fieldLabel;
      });
    }

    // --- We record EVERY attempt, so we skip searching for existingScan here ---
    /* =======================
       ❌ FAKE PRODUCT
    ======================= */
    if (!product) {
      return res.json({
        status: "FAKE",
        data: {
          qrCode,
          productId: null,
          productName: null,
          brand: brandNameFromPrefix,
          expiryDate: null,
          place,
          latitude,
          longitude,
          scannedAt: scannedAt,
          brandId: brandIdFromPrefix,
        },
      });
    }

    // Resolve final brand data from product or prefix
    const finalBrandId = product.brandId || brandIdFromPrefix;
    const finalBrandName = product.brand || brandNameFromPrefix;

    /* =======================
       🚫 INACTIVE PRODUCT
    ======================= */
    if (!product.isActive) {
      console.log("Record scan: INACTIVE", { userId, qrCode });
      const scan = await Scan.create({
        userId,
        productId: product._id,
        brandId: finalBrandId,
        brand: finalBrandName,
        qrCode,
        productName: product.productName,
        status: "INACTIVE",
        place,
        latitude,
        longitude,
      });

      return res.json({
        status: "INACTIVE",
        message: "This QR code is inactive.",
        data: {
          qrCode,
          productId: product._id,
          brandId: finalBrandId,
          companyName: product.brandId?.companyId?.companyName || null,
          productName: product.productName || product.orderId?.productName,
          brand: finalBrandName,
          batchNo: product.batchNo || product.orderId?.batchNo,
          productImage: product.productImage || product.orderId?.productImage,
          category: product.category || product.orderId?.category,
          mrp: product.mrp || product.orderId?.mrp,
          manufacturedBy: product.manufacturedBy || product.orderId?.manufacturedBy,
          marketedBy: product.marketedBy || product.orderId?.marketedBy,
          importMarketedBy: product.importMarketedBy || product.orderId?.importMarketedBy,
          importerRegNo: product.importerRegNo || product.orderId?.importerRegNo,
          countryOfOrigin: product.countryOfOrigin || product.orderId?.countryOfOrigin,
          website: product.website || product.orderId?.website,
          supportEmail: product.supportEmail || product.orderId?.supportEmail,
          customerCare: product.customerCare || product.orderId?.customerCare,
          keyBenefits: product.keyBenefits || product.orderId?.keyBenefits,
          mfdOn: (product.mfdOn?.month) ? product.mfdOn : product.orderId?.mfdOn,
          description: product.description || product.orderId?.description,
          productInfo: product.productInfo || product.orderId?.productInfo,
          bestBefore: (product.bestBefore?.value) ? product.bestBefore : product.orderId?.bestBefore,
          calculatedExpiryDate: product.calculatedExpiryDate || product.orderId?.calculatedExpiryDate,
          dynamicFields: (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : product.orderId?.dynamicFields,
          variants: (product.variants && product.variants.length > 0) ? product.variants : product.orderId?.variants,
          fieldLabels,
          alreadyReviewed,
          place,
          scannedAt: scan.createdAt
        }
      });
    }

    // 2️⃣  Has THIS user already scanned this product?
    const myPreviousScan = await Scan.findOne({
      productId: product._id,
      userId: userId,
      status: "ORIGINAL",
    });

    /* =======================
       ✅ SAME USER RE-SCANNING THEIR OWN PRODUCT
    ======================= */
    if (myPreviousScan) {
      // Don't create another record — just return ORIGINAL for their own product
      return res.json({
        status: "ORIGINAL",
        data: {
          qrCode,
          productId: product._id,
          companyName: product.brandId?.companyId?.companyName || null,
          productName: product.productName || product.orderId?.productName,
          brand: product.brand || finalBrandName,
          batchNo: product.batchNo || product.orderId?.batchNo,
          manufactureDate: product.manufactureDate || product.orderId?.manufactureDate,
          expiryDate: product.expiryDate || product.orderId?.expiryDate,
          productImage: product.productImage || product.orderId?.productImage,
          category: product.category || product.orderId?.category,
          mrp: product.mrp || product.orderId?.mrp,
          manufacturedBy: product.manufacturedBy || product.orderId?.manufacturedBy,
          marketedBy: product.marketedBy || product.orderId?.marketedBy,
          importMarketedBy: product.importMarketedBy || product.orderId?.importMarketedBy,
          importerRegNo: product.importerRegNo || product.orderId?.importerRegNo,
          countryOfOrigin: product.countryOfOrigin || product.orderId?.countryOfOrigin,
          website: product.website || product.orderId?.website,
          supportEmail: product.supportEmail || product.orderId?.supportEmail,
          customerCare: product.customerCare || product.orderId?.customerCare,
          keyBenefits: product.keyBenefits || product.orderId?.keyBenefits,
          mfdOn: (product.mfdOn?.month) ? product.mfdOn : product.orderId?.mfdOn,
          description: product.description || product.orderId?.description,
          productInfo: product.productInfo || product.orderId?.productInfo,
          bestBefore: (product.bestBefore?.value) ? product.bestBefore : product.orderId?.bestBefore,
          calculatedExpiryDate: product.calculatedExpiryDate || product.orderId?.calculatedExpiryDate,
          dynamicFields: (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : product.orderId?.dynamicFields,
          variants: (product.variants && product.variants.length > 0) ? product.variants : product.orderId?.variants,
        fieldLabels,
          alreadyReviewed,
          place,
          latitude,
          longitude,
          scannedAt: new Date(),
          hasCoupon: !!(await ProductCoupon.findOne({ productId: product._id, isActive: true }).lean()),
        },
      });
    }

    // 3️⃣  Has a DIFFERENT user already scanned this product?
    const alreadyUsed = await Scan.findOne({
      productId: product._id,
      userId: { $ne: userId },
      status: "ORIGINAL",
    });

    /* =======================
       ⚠️ ALREADY USED BY ANOTHER USER
    ======================= */
    if (alreadyUsed) {
      await alreadyUsed.populate("userId", "mobile");

      const scan = await Scan.create({
        userId,
        productId: product._id,
        brandId: finalBrandId,
        brand: finalBrandName,
        qrCode,
        productName: product.productName,
        expiryDate: product.expiryDate,
        status: "ALREADY_USED",
        place,
        latitude,
        longitude,
      });

      // Mask mobile
      let masked = 'Unknown';
      if (alreadyUsed.userId && alreadyUsed.userId.mobile) {
        const m = alreadyUsed.userId.mobile.toString();
        masked = m.length > 5 ? m.slice(0, 3) + '*'.repeat(m.length - 5) + m.slice(-2) : m;
      }

      return res.json({
        status: "ALREADY_USED",
        data: {
          qrCode,
          productId: product._id,
          brandId: finalBrandId,
          companyName: product.brandId?.companyId?.companyName || null,
          productName: product.productName || product.orderId?.productName,
          brand: product.brand || finalBrandName,
          batchNo: product.batchNo || product.orderId?.batchNo,
          manufactureDate: product.manufactureDate || product.orderId?.manufactureDate,
          expiryDate: product.expiryDate || product.orderId?.expiryDate,
          productImage: product.productImage || product.orderId?.productImage,
          category: product.category || product.orderId?.category,
          mrp: product.mrp || product.orderId?.mrp,
          manufacturedBy: product.manufacturedBy || product.orderId?.manufacturedBy,
          marketedBy: product.marketedBy || product.orderId?.marketedBy,
          importMarketedBy: product.importMarketedBy || product.orderId?.importMarketedBy,
          importerRegNo: product.importerRegNo || product.orderId?.importerRegNo,
          countryOfOrigin: product.countryOfOrigin || product.orderId?.countryOfOrigin,
          website: product.website || product.orderId?.website,
          supportEmail: product.supportEmail || product.orderId?.supportEmail,
          customerCare: product.customerCare || product.orderId?.customerCare,
          keyBenefits: product.keyBenefits || product.orderId?.keyBenefits,
          mfdOn: (product.mfdOn?.month) ? product.mfdOn : product.orderId?.mfdOn,
          description: product.description || product.orderId?.description,
          productInfo: product.productInfo || product.orderId?.productInfo,
          bestBefore: (product.bestBefore?.value) ? product.bestBefore : product.orderId?.bestBefore,
          calculatedExpiryDate: product.calculatedExpiryDate || product.orderId?.calculatedExpiryDate,
          dynamicFields: (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : product.orderId?.dynamicFields,
          variants: (product.variants && product.variants.length > 0) ? product.variants : product.orderId?.variants,
          fieldLabels,
          alreadyReviewed,
          place,
          scannedAt: scan.createdAt,
          originalScan: {
            scannedBy: masked,
            scannedAt: alreadyUsed.createdAt,
            place: alreadyUsed.place,
          }
        },
      });
    }

    /* =======================
       ✅ ORIGINAL (FIRST SCAN)
    ======================= */
    const scan = await Scan.create({
      userId,
      productId: product._id,
      brandId: finalBrandId,
      brand: finalBrandName,
      qrCode,
      productName: product.productName,
      expiryDate: product.expiryDate,
      status: "ORIGINAL",
      place,
      latitude,
      longitude,
    });

    return res.json({
      status: "ORIGINAL",
      data: {
        qrCode,
        productId: product._id,
        brandId: finalBrandId,
        companyName: product.brandId?.companyId?.companyName || null,
        productName: product.productName,
        brand: product.brand || finalBrandName,
        batchNo: product.batchNo,
        manufactureDate: product.manufactureDate,
        expiryDate: product.expiryDate,
        productImage: product.productImage || product.orderId?.productImage,
        mfdOn: (product.mfdOn?.month) ? product.mfdOn : product.orderId?.mfdOn,
        description: product.description || product.orderId?.description,
        productInfo: product.productInfo || product.orderId?.productInfo,
        bestBefore: (product.bestBefore?.value) ? product.bestBefore : product.orderId?.bestBefore,
        calculatedExpiryDate: product.calculatedExpiryDate || product.orderId?.calculatedExpiryDate,
        dynamicFields: (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : product.orderId?.dynamicFields,
        variants: (product.variants && product.variants.length > 0) ? product.variants : product.orderId?.variants,
        fieldLabels,
        alreadyReviewed,
        place,
        latitude,
        longitude,
      scannedAt: scan.createdAt,
          hasCoupon: !!(await ProductCoupon.findOne({ productId: product._id, isActive: true }).lean()),
      },
    });
  } catch (err) {
    console.error("Scan storage error:", err);
    res.status(500).json({ error: "Scan failed to save" });
  }
});

// Get all scans for a brand (Company/Admin view)
router.get("/company/all", protect, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'company' || req.user.role === 'authorizer') {
      const bid = req.user.brandId;
      if (!bid) return res.status(403).json({ error: "No brand associated with this user" });
      query = { brandId: bid };
    } else if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Admins can filter by brandId via query param
    if ((req.user.role === 'admin' || req.user.role === 'superadmin') && req.query.brandId) {
      query = { brandId: req.query.brandId };
    }

    const scans = await Scan.find(query)
      .populate('userId', 'name mobile email')
      .populate('productId', 'productName brand batchNo')
      .sort({ createdAt: -1 });

    res.json(scans);
  } catch (err) {
    console.error("Error fetching company scans:", err);
    res.status(500).json({ error: "Failed to fetch scans" });
  }
});

// --- REPORTING SYSTEM ---

// Submit a report
router.post("/report", protect, async (req, res) => {
  try {
    const user = req.user; // Already populated by protect
    if (!user.name || !user.mobile) {
      return res.status(400).json({ 
        error: "Profile incomplete", 
        message: "Please update your name and contact details in your profile before reporting." 
      });
    }

    const { productName, brand, description, reportType, images, latitude, longitude, qrCode, productId, brandId, scanStatus } = req.body;

    // 2. Check for duplicate report - same user, same QR code
    if (qrCode) {
      const existing = await Report.findOne({ userId, qrCode });
      if (existing) {
        return res.status(400).json({ 
          error: "Duplicate report", 
          message: "You have already submitted a report for this product. Each user can report a product only once." 
        });
      }
    }

    if (!images || !Array.isArray(images) || images.length < 3) {
      return res.status(400).json({ error: "Minimum 3 images required" });
    }

    const place = await getPlaceFromCoords(latitude, longitude);

    // Create report with scan data
    const report = await Report.create({
      userId,
      productName,
      brand: brand || "",
      description: description || "",
      reportType: reportType || "COUNTERFEIT",
      images,
      latitude,
      longitude,
      place,
      qrCode,
      status: "Pending",
      scanData: {
        productId: productId || null,
        brandId: brandId || null,
        scanStatus: scanStatus || "FAKE",
        scannedAt: new Date(),
      },
    });

    // NOW create the scan record (only when report is submitted)
    if (scanStatus === "FAKE" || scanStatus === "ALREADY_USED") {
      try {
        await Scan.create({
          userId,
          productId: productId || null,
          brandId: brandId || null,
          brand: brand || "",
          qrCode: qrCode,
          productName: productName,
          status: scanStatus,
          place,
          latitude,
          longitude,
        });
        console.log("Scan record created during report submission");
      } catch (scanErr) {
        console.warn("Failed to create scan record:", scanErr.message);
        // Don't fail the report if scan creation fails
      }
    }

    res.status(201).json({ 
      success: true, 
      message: "Report submitted successfully. Our team will investigate this.",
      report 
    });
  } catch (err) {
    // Handle MongoDB duplicate key error gracefully
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: "Duplicate report", 
        message: "You have already submitted a report for this product." 
      });
    }
    console.error("Report submission error:", err);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// Get user's reports
router.get("/reports/my", protect, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Get all reports (Admin/Company View) with user population
// If it's a company user, they only see reports for their brands
router.get("/reports/all", protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'company' || req.user.role === 'authorizer') {
      const brandId = req.user.brandId;
      // Resolve brand name from brandId to filter reports
      const Brand = require("../models/Brand");
      const brand = await Brand.findById(brandId);
      if (brand) {
        query.brand = { $regex: new RegExp(brand.brandName, "i") };
      }
      query.reportType = "FAKE"; // Company/Authorizer sees Duplicate/Repeated scans
    } else if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      query.reportType = "COUNTERFEIT"; // Admins see Counterfeit scans initially
    } else {
      return res.status(403).json({ error: "Not authorized" });
    }

    const reports = await Report.find(query).populate('userId', 'name mobile').sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Error fetching all reports:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Toggle counterfeit flag on a report
router.put("/reports/:id/counterfeit", protect, async (req, res) => {
  try {
    if (!['admin', 'superadmin', 'company'].includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    report.isCounterfeit = !report.isCounterfeit;
    await report.save();
    res.json(report);
  } catch (err) {
    console.error("Error toggling counterfeit:", err);
    res.status(500).json({ error: "Failed to update report" });
  }
});

// Update report status
router.put("/reports/:id/status", protect, async (req, res) => {
  try {
    if (!['admin', 'superadmin', 'company'].includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized to update status" });
    }
    const report = await Report.findByIdAndUpdate(
        req.params.id, 
        { status: req.body.status },
        { new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to update report" });
  }
});

module.exports = router;
