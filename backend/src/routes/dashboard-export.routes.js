const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Company = require('../models/Company');
const Brand = require('../models/Brand');

// GET /dashboard/export — Download dashboard data as Excel
router.get('/export', protect, authorize('superadmin', 'admin', 'authorizer', 'company'), async (req, res) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months) || 3, 1), 12);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setHours(0, 0, 0, 0);

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Authentiks Dashboard';
    workbook.created = new Date();

    // ── Build match query based on role ──
    let orderMatch = { createdAt: { $gte: startDate } };
    let productMatch = { createdAt: { $gte: startDate } };

    if (!['admin', 'superadmin'].includes(req.user.role)) {
      const userBrandId = req.user.brandId?._id || req.user.brandId;
      const userBrandIds = (req.user.brandIds || []).map(id => id?._id || id);
      const allBrandIds = [...(userBrandId ? [userBrandId] : []), ...userBrandIds].filter(Boolean);
      if (allBrandIds.length > 0) {
        orderMatch.brandId = { $in: allBrandIds };
        productMatch.brandId = { $in: allBrandIds };
      }
    }

    // ── Sheet 1: Orders Summary ──
    const orders = await Order.find(orderMatch)
      .populate('createdBy', 'name email')
      .populate('brandId', 'brandName')
      .sort({ createdAt: -1 })
      .lean();

    const ordersSheet = workbook.addWorksheet('Orders');
    ordersSheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 25 },
      { header: 'Product', key: 'productName', width: 25 },
      { header: 'Brand', key: 'brand', width: 20 },
      { header: 'Batch No', key: 'batchNo', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Created By', key: 'createdBy', width: 25 },
      { header: 'Created At', key: 'createdAt', width: 22 },
    ];
    // Style header row  
    ordersSheet.getRow(1).font = { bold: true, size: 11 };
    ordersSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    ordersSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const o of orders) {
      ordersSheet.addRow({
        orderId: o.orderId || '',
        productName: o.productName || '',
        brand: o.brand || o.brandId?.brandName || '',
        batchNo: o.batchNo || '',
        quantity: o.quantity || 0,
        status: o.status || '',
        createdBy: o.createdBy?.name || o.createdBy?.email || '',
        createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : '',
      });
    }

    // ── Sheet 2: QR Products / Scan Analytics ──
    const scanSheet = workbook.addWorksheet('Scan Analytics');
    const scanAgg = await Product.aggregate([
      { $match: productMatch },
      {
        $group: {
          _id: { brand: '$brand', productName: '$productName' },
          totalQrs: { $sum: 1 },
          totalScans: { $sum: '$scanCount' },
          activeQrs: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      },
      { $sort: { totalScans: -1 } }
    ]);

    scanSheet.columns = [
      { header: 'Brand', key: 'brand', width: 20 },
      { header: 'Product', key: 'product', width: 25 },
      { header: 'Total QRs', key: 'totalQrs', width: 12 },
      { header: 'Active QRs', key: 'activeQrs', width: 12 },
      { header: 'Total Scans', key: 'totalScans', width: 14 },
    ];
    scanSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    scanSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };

    for (const s of scanAgg) {
      scanSheet.addRow({
        brand: s._id.brand || '',
        product: s._id.productName || '',
        totalQrs: s.totalQrs || 0,
        activeQrs: s.activeQrs || 0,
        totalScans: s.totalScans || 0,
      });
    }

    // ── Sheet 3: Status Distribution ──
    const statusSheet = workbook.addWorksheet('Status Distribution');
    const statusAgg = await Order.aggregate([
      { $match: orderMatch },
      { $group: { _id: '$status', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } },
      { $sort: { count: -1 } }
    ]);

    statusSheet.columns = [
      { header: 'Status', key: 'status', width: 25 },
      { header: 'Order Count', key: 'count', width: 15 },
      { header: 'Total Quantity', key: 'totalQty', width: 18 },
    ];
    statusSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    statusSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };

    for (const s of statusAgg) {
      statusSheet.addRow({ status: s._id || '', count: s.count, totalQty: s.totalQty });
    }

    // ── Sheet 4: Monthly Trend ──
    const trendSheet = workbook.addWorksheet('Monthly Trends');
    const monthlyAgg = await Order.aggregate([
      { $match: orderMatch },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          orders: { $sum: 1 },
          totalQty: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    trendSheet.columns = [
      { header: 'Month', key: 'month', width: 15 },
      { header: 'Orders', key: 'orders', width: 12 },
      { header: 'Total Quantity', key: 'totalQty', width: 18 },
    ];
    trendSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    trendSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };

    for (const m of monthlyAgg) {
      trendSheet.addRow({
        month: `${String(m._id.month).padStart(2, '0')}/${m._id.year}`,
        orders: m.orders,
        totalQty: m.totalQty,
      });
    }

    // ── Stream response ──
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=authentiks_dashboard_${months}months.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Dashboard export error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Export failed', error: error.message });
    }
  }
});

module.exports = router;
