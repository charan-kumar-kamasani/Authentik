const mongoose = require("mongoose");

// Simplified Brand model: only stores brand name, logo and links to a Company
const brandSchema = new mongoose.Schema(
  {
    brandName: { type: String, required: true },
    brandLogo: { type: String }, // URL or path to logo
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Brand", brandSchema);