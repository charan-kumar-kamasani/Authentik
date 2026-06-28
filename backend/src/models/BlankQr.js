const mongoose = require("mongoose");

const blankQrSchema = new mongoose.Schema(
  {
    qrCode: {
      type: String,
      required: true,
      unique: true,
    },
    serialNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    isAssigned: {
      type: Boolean,
      default: false,
    },
    assignedToProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    assignedToCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      enum: ['lost', 'damaged', 'other', null],
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Performance Indexes
blankQrSchema.index({ isAssigned: 1 });
blankQrSchema.index({ assignedToCompany: 1 });
blankQrSchema.index({ createdAt: -1 });

module.exports = mongoose.model("BlankQr", blankQrSchema);
