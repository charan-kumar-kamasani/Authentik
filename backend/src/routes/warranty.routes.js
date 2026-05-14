const express = require('express');
const WarrantyClaim = require('../models/WarrantyClaim');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── 1. SUBMIT WARRANTY CLAIM (Authenticated User) ─────────────────
router.post('/claim', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      productId,
      qrCode,
      productName,
      brandId,
      invoiceImages,
      purchaseDate,
      warrantyInfo,
    } = req.body;

    // Validate invoice images
    if (!invoiceImages || !Array.isArray(invoiceImages) || invoiceImages.length === 0) {
      return res.status(400).json({ error: 'At least 1 invoice image is required' });
    }
    if (invoiceImages.length > 3) {
      return res.status(400).json({ error: 'Maximum 3 invoice images allowed' });
    }

    // Validate purchase date
    if (!purchaseDate) {
      return res.status(400).json({ error: 'Purchase date is required' });
    }

    // Check for duplicate claim by same user for same product
    if (productId) {
      const existing = await WarrantyClaim.findOne({ userId, productId });
      if (existing) {
        return res.status(400).json({
          error: 'Duplicate claim',
          message: 'You have already submitted a warranty claim for this product.',
        });
      }
    }

    // If productId provided, fetch warranty info from product
    let resolvedWarrantyInfo = warrantyInfo || null;
    if (productId && !resolvedWarrantyInfo) {
      const product = await Product.findById(productId).populate('orderId').lean();
      if (product) {
        resolvedWarrantyInfo = product.warranty || product.orderId?.warranty || null;
      }
    }

    const claim = await WarrantyClaim.create({
      userId,
      productId: productId || null,
      brandId: brandId || null,
      qrCode: qrCode || '',
      productName: productName || '',
      invoiceImages,
      purchaseDate: new Date(purchaseDate),
      warrantyInfo: resolvedWarrantyInfo,
      status: 'Sent',
    });

    res.status(201).json({
      success: true,
      message: 'Warranty claim submitted successfully. Our team will review it.',
      claim,
    });
  } catch (err) {
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate claim',
        message: 'You have already submitted a warranty claim for this product.',
      });
    }
    console.error('Warranty claim submission error:', err);
    res.status(500).json({ error: 'Failed to submit warranty claim' });
  }
});

// ─── 2. GET MY WARRANTY CLAIMS (Authenticated User) ────────────────
router.get('/my-claims', protect, async (req, res) => {
  try {
    const claims = await WarrantyClaim.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(claims);
  } catch (err) {
    console.error('Error fetching user warranty claims:', err);
    res.status(500).json({ error: 'Failed to fetch warranty claims' });
  }
});

// ─── 3. GET ALL WARRANTY CLAIMS (Admin / Authorizer / Creator) ──────
router.get('/claims', protect, async (req, res) => {
  try {
    const { role } = req.user;

    // Only admin, superadmin, authorizer, creator, company can view claims
    if (!['admin', 'superadmin', 'authorizer', 'creator', 'company'].includes(role)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    let query = {};

    // Scope by brand for non-admin roles
    if (['authorizer', 'creator', 'company'].includes(role)) {
      const userBrandId = req.user.brandId?._id || req.user.brandId;
      const userBrandIds = (req.user.brandIds || []).map(id => id?._id || id);
      const allBrandIds = Array.from(new Set([
        ...(userBrandId ? [userBrandId.toString()] : []),
        ...userBrandIds.map(id => id.toString()),
      ])).filter(Boolean);

      if (allBrandIds.length > 0) {
        query.brandId = { $in: allBrandIds };
      } else {
        // No brands linked, return empty
        return res.json([]);
      }
    }

    // Optional status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    const claims = await WarrantyClaim.find(query)
      .populate('userId', 'name mobile email')
      .populate('productId', 'productName brand batchNo qrCode')
      .sort({ createdAt: -1 })
      .lean();

    res.json(claims);
  } catch (err) {
    console.error('Error fetching all warranty claims:', err);
    res.status(500).json({ error: 'Failed to fetch warranty claims' });
  }
});

// ─── 4. UPDATE CLAIM STATUS (Admin / Authorizer) ────────────────────
router.put('/claims/:id/status', protect, async (req, res) => {
  try {
    const { role } = req.user;

    if (!['admin', 'superadmin', 'authorizer', 'company'].includes(role)) {
      return res.status(403).json({ error: 'Not authorized to update claim status' });
    }

    const { status, adminNotes } = req.body;

    if (!status || !['Sent', 'Processing', 'Reviewing', 'Contacted', 'Resolved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be Sent, Processing, Reviewing, Contacted, Resolved, or Rejected.' });
    }

    const claim = await WarrantyClaim.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes: adminNotes || '',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!claim) {
      return res.status(404).json({ error: 'Warranty claim not found' });
    }

    res.json(claim);
  } catch (err) {
    console.error('Error updating warranty claim status:', err);
    res.status(500).json({ error: 'Failed to update warranty claim' });
  }
});

module.exports = router;
