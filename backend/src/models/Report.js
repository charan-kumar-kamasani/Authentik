const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportType: {
      type: String,
      enum: ["COUNTERFEIT", "FAKE"],
      required: true,
      default: "COUNTERFEIT",
    },
    productName: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
    },
    description: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    place: {
      type: String,
      default: "Unknown location",
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    qrCode: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Resolved", "Investigating"],
      default: "Pending",
    },
    isCounterfeit: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent a user from reporting the same QR code more than once
reportSchema.index({ userId: 1, qrCode: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Report", reportSchema);
