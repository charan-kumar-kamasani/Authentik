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
    },
    { timestamps: true }
  )
);
