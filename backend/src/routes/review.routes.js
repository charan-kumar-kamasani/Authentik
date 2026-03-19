const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Create a product review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, optIn, couponCode, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ error: 'Product ID and rating are required' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId: req.user._id });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      productId,
      userId: req.user._id,
      rating,
      optIn,
      couponCode,
      comment
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get reviews for a specific product
// @route   GET /api/reviews/product/:productId
// @access  Private (Admin/SuperAdmin)
router.get('/product/:productId', protect, authorize('admin', 'superadmin', 'company'), async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name mobile email')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get all reviews (Superadmin only)
// @route   GET /api/reviews/all
// @access  Private (SuperAdmin)
router.get('/all', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('productId', 'productName brand')
      .populate('userId', 'name mobile email')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
