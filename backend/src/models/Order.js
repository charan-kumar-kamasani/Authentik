const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  brand: { type: String, required: true },
  batchNo: { type: String },
  manufactureDate: { type: String },
  expiryDate: { type: String },
  quantity: { type: Number, required: true },
  description: { type: String },
  productInfo: { type: String },
  productImage: { type: String }, // URL of the product image

  
  // Who created it (Creator)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // The company this order belongs to
  // Legacy: company (user) -- kept for backwards compatibility but prefer brandId
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Prefer linking orders to a Brand
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },

  // New: Link to a Company consistently
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

  // Detailed fields (matching ProductTemplate)
  category: String,
  mrp: Number,
  keyBenefits: String,
  manufacturedBy: String,
  marketedBy: String,
  importMarketedBy: String,
  importerRegNo: String,
  countryOfOrigin: String,
  website: String,
  supportEmail: String,
  customerCare: String,

  // Dynamic form fields (new)
  mfdOn: {
    month: String, // MM format (01-12)
    year: String,  // YYYY format
  },
  bestBefore: {
    value: Number,
    unit: { type: String, enum: ['months', 'years'] },
  },
  // Auto-calculated expiry based on mfdOn + bestBefore
  calculatedExpiryDate: String, // MM/YYYY format
  // Store variants (repeatable fields like Color, Size, Model)
  variants: [{
    variantName: String,  // e.g., "Color", "Size", "Model"
    variantLabel: String,
    inputType: { type: String, enum: ['color', 'text', 'dropdown'], default: 'text' },
    value: String,        // e.g., "Red", "Large", "Pro Series"
    options: [String]
  }],
  // Store all dynamic field values as key-value pairs
  dynamicFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // Current status
  status: {
    type: String,
    enum: [
      'Pending Authorization',      // Step 1: Creator creates QR order
      'Authorized',                 // Step 2: Authorizer approves
      'Order Processing',           // Step 3: Super Admin accepts & generates QRs
      'Dispatching',                // Step 4: Super Admin preparing dispatch
      'Dispatched',                 // Step 5: Super Admin dispatched to factory
      'Received',                   // Step 6: Authorizer marks as received (FINAL - activates QRs)
      'Rejected'                    // Can be rejected at any stage
    ],
    default: 'Pending Authorization'
  },

  // Audit trail
  history: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    timestamp: { type: Date, default: Date.now },
    comment: String
  }],

  // Dispatch details
  dispatchDetails: {
    trackingNumber: String,
    dispatchedDate: Date,
    courierName: String,
    notes: String
  },
  
  // Promotional coupon attached to this order's products
  coupon: {
    code: { type: String, trim: true, uppercase: true },
    description: { type: String, trim: true },
    expiryDate: { type: Date, default: null },
  },

  // Track QR generation
  qrCodesGenerated: { type: Boolean, default: false },
  qrGeneratedCount: { type: Number, default: 0 },
  bonusQuantity: { type: Number, default: 0 },

}, { timestamps: true });

// Performance Indexes
orderSchema.index({ brandId: 1 });
orderSchema.index({ companyId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdBy: 1 });
orderSchema.index({ createdAt: -1 }); // Often sorted by newest first

module.exports = mongoose.model('Order', orderSchema);
