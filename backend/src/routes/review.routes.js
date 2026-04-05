const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const ProductCoupon = require('../models/ProductCoupon');
const UserReward = require('../models/UserReward');
const Scan = require('../models/Scan');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Create a product review + award coupon if available
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

    // --- Award coupon if this product has one ---
    let awardedCoupon = null;
    try {
      // productId here could be either the Product._id or ProductTemplate._id
      // Check ProductCoupon for this product
      const productCoupon = await ProductCoupon.findOne({ 
        productId: productId, 
        isActive: true 
      });

      if (productCoupon) {
        // Check if coupon hasn't expired
        const now = new Date();
        const isExpired = productCoupon.expiryDate && now > productCoupon.expiryDate;
        
        if (!isExpired) {
          // Check if user already has this reward
          const existingReward = await UserReward.findOne({ 
            userId: req.user._id, 
            productCouponId: productCoupon._id 
          });

          if (!existingReward) {
            // Fetch product info for denormalization
            const product = await Product.findById(productId).lean();
            
            // Find the user's scan for this product
            const scan = await Scan.findOne({ 
              userId: req.user._id, 
              productId: productId,
              status: 'ORIGINAL'
            }).lean();

            const reward = await UserReward.create({
              userId: req.user._id,
              productCouponId: productCoupon._id,
              productId: productId,
              scanId: scan ? scan._id : null,
              reviewId: review._id,
              couponCode: productCoupon.code,
              couponDescription: productCoupon.description,
              couponExpiry: productCoupon.expiryDate,
              productName: product?.productName || '',
              productImage: product?.productImage || null,
              brand: product?.brand || '',
              scannedAt: scan ? scan.createdAt : new Date(),
              reviewRating: rating,
              reviewComment: comment || '',
            });

            awardedCoupon = {
              code: productCoupon.code,
              description: productCoupon.description,
              expiryDate: productCoupon.expiryDate,
              rewardId: reward._id,
            };
          }
        }
      }
    } catch (couponErr) {
      console.warn('Coupon award check failed (non-blocking):', couponErr.message);
    }

    res.status(201).json({ 
      ...review.toObject(), 
      coupon: awardedCoupon 
    });
  } catch (err) {
    console.error('Review creation error:', err);
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

// @desc    Get all rewards for the logged-in mobile user
// @route   GET /api/reviews/my-rewards
// @access  Private
router.get('/my-rewards', protect, async (req, res) => {
  try {
    const rewards = await UserReward.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(rewards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get a single reward detail
// @route   GET /api/reviews/my-rewards/:id
// @access  Private
router.get('/my-rewards/:id', protect, async (req, res) => {
  try {
    const reward = await UserReward.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    })
      .populate('productId')
      .populate('scanId')
      .lean();

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json(reward);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
