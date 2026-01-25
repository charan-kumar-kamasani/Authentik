const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Product",
  new mongoose.Schema(
    {
      qrCode: String,
      productName: String,
      brand: String,
      batchNo: String,
      manufactureDate: String,
      expiryDate: String,
      quantity: Number,
      sequence: { type: Number, default: 0 }, // New field to track order
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    { timestamps: true }
  )
);
