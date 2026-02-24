const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
