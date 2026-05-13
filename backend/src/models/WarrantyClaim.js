const mongoose = require('mongoose');

const warrantyClaimSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    default: null,
  },
  qrCode: { type: String },
  productName: { type: String },

  // Invoice images (Cloudinary URLs, max 3)
  invoiceImages: [{
    type: String, // Cloudinary URLs
  }],

  // Purchase details
  purchaseDate: { type: Date },
  purchaseSource: { type: String, trim: true },  // e.g. "Amazon", "Retail Store"
  sellerName: { type: String, trim: true },

  // Warranty info snapshot (copied from product/order at claim time)
  warrantyInfo: {
    duration: Number,
    durationUnit: { type: String, enum: ['months', 'years'] },
    warrantyType: String,
    description: String,
  },

  // Claim status
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },

  // Admin/reviewer notes
  adminNotes: { type: String, default: '' },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reviewedAt: { type: Date, default: null },

}, { timestamps: true });

// Performance Indexes
warrantyClaimSchema.index({ userId: 1 });
warrantyClaimSchema.index({ productId: 1 });
warrantyClaimSchema.index({ brandId: 1 });
warrantyClaimSchema.index({ status: 1 });
warrantyClaimSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WarrantyClaim', warrantyClaimSchema);
