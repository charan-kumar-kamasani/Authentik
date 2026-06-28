const mongoose = require("mongoose");

const stockRequestSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"]
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Preparing for Dispatch", "Dispatched", "Received", "Rejected"],
      default: "Pending",
    },
    notes: {
      type: String,
    },
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending"
    },
    amount: {
      type: Number,
      default: 0
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockRequest", stockRequestSchema);
