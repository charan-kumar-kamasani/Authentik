const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Product",
  new mongoose.Schema(
    {
      qrCode: String,
      productName: String,
      brand: String,
      brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', default: null },
      batchNo: String,
      manufactureDate: String,
      expiryDate: String,
      quantity: Number,
      sequence: { type: Number, default: 0 },
      orderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Order",
        default: null 
      },
      isActive: { 
        type: Boolean, 
        default: false 
      }, // QR codes are inactive until authorizer marks order as received/done
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      // Dynamic form fields
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
        value: String,        // e.g., "Red", "Large", "Pro Series"
      }],
      // Store all dynamic field values as key-value pairs
      dynamicFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    { timestamps: true }
  )
);
