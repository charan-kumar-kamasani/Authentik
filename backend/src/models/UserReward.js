const mongoose = require('mongoose');

const userRewardSchema = new mongoose.Schema({
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productCouponId:   { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCoupon', required: true },
  productId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  scanId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Scan', default: null },
  reviewId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null },
  // Denormalized coupon info for quick display
  couponCode:        { type: String, required: true },
  couponDescription: { type: String, default: '' },
  couponExpiry:      { type: Date, default: null },
  // Denormalized product info
  productName:       { type: String, default: '' },
  productImage:      { type: String, default: null },
  brand:             { type: String, default: '' },
  // Scan/review context
  scannedAt:         { type: Date, default: null },
  reviewRating:      { type: Number, default: 0 },
  reviewComment:     { type: String, default: '' },
  // Redemption
  isRedeemed:        { type: Boolean, default: false },
  redeemedAt:        { type: Date, default: null },
}, { timestamps: true });

// A user can only earn one reward per product coupon
userRewardSchema.index({ userId: 1, productCouponId: 1 }, { unique: true });
// Fast lookup for user's rewards list
userRewardSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('UserReward', userRewardSchema);
