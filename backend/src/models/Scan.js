const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Scan",
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: null, // FAKE products won’t have this
      },

      qrCode: { type: String, required: true },

      productName: String,
      expiryDate: String,

      status: {
        type: String,
        enum: ["ORIGINAL", "FAKE", "ALREADY_USED"],
        required: true,
      },

      place: String,
      latitude: Number,
      longitude: Number,
    },
    { timestamps: true }
  )
);
