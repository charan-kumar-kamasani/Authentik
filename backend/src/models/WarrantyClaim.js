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

  // Warranty info snapshot (copied from product/order at claim time)
  warrantyInfo: {
    duration: Number,
    durationUnit: { type: String, enum: ['months', 'years'] },
    warrantyType: String,
    description: String,
  },

  // Claim specific fields
  issue: { type: String, default: '' },
  claimDescription: { type: String, default: '' },
  claimImages: [{ type: String }], // Cloudinary URLs for proof of issue

  // Claim status
  status: {
    type: String,
    enum: ['Sent', 'Processing', 'Reviewing', 'Contacted', 'Resolved', 'Rejected'],
    default: 'Sent',
  },

  // Status History for Audit Trail
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    notes: String
  }],

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
