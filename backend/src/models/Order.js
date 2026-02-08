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
  
  // Who created it (Creator)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // The company this order belongs to
  // Legacy: company (user) -- kept for backwards compatibility but prefer brandId
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Prefer linking orders to a Brand
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },

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
  
  // Track QR generation
  qrCodesGenerated: { type: Boolean, default: false },
  qrGeneratedCount: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
