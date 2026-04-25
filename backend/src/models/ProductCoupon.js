const mongoose = require('mongoose');

const productCouponSchema = new mongoose.Schema({
  title:       { type: String, trim: true },
  code:        { type: String, trim: true, uppercase: true },
  description: { type: String, default: '' },
  websiteLink: { type: String, trim: true },
  expiryDate:  { type: Date, default: null },
  // Links
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  orderId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  brandId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', default: null },
  companyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// Index for fast lookup when a user scans a product
productCouponSchema.index({ productId: 1, isActive: 1 });
productCouponSchema.index({ orderId: 1 });

module.exports = mongoose.model('ProductCoupon', productCouponSchema);
