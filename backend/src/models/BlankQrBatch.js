const mongoose = require("mongoose");

const blankQrBatchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    startSerialNumber: {
      type: Number,
      required: true,
    },
    endSerialNumber: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

blankQrBatchSchema.index({ createdAt: -1 });

module.exports = mongoose.model("BlankQrBatch", blankQrBatchSchema);
