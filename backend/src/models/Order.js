const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  description: { type: String },
  
  // Who created it (Creator)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // The company this order belongs to
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Current status
  status: {
    type: String,
    enum: [
      'Pending Authorization', // Yellow - Created by Creator
      'Authorized',            // Purple - Approved by Authorizer/Company
      'Accepted & Ready to Print', // Blue - Accepted by Authentick (Super Admin)
      'Dispatched - Pending Activation', // Orange - Dispatched by Authentick
      'Activated',             // Green - Activated by Authorizer/System
      'Rejected / Cancelled'   // Red
    ],
    default: 'Pending Authorization'
  },

  // Audit trail
  history: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String, // Role of the user at the time
    timestamp: { type: Date, default: Date.now },
    comment: String
  }],

  // Additional fields for dispatch/shipping
  dispatchDetails: {
    trackingNumber: String,
    dispatchedDate: Date,
    notes: String
  },
  
  // Optional: Link to generated QR Codes/Products if pre-generated
  qrCodes: [{ type: String }] // or references to Product model

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
