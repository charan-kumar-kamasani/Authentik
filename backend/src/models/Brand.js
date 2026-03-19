const mongoose = require("mongoose");

// Simplified Brand model: only stores brand name, logo and links to a Company
const brandSchema = new mongoose.Schema(
  {
    brandName: { type: String, required: true },
    brandLogo: { type: String }, // URL or path to logo
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    legalEntity: { type: String },
    brandWebsite: { type: String },
    industry: { type: String },
    country: { type: String },
    city: { type: String },
    cinGst: { type: String },
    registerOfficeAddress: { type: String },
    dispatchAddress: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    supportNumber: { type: String },
    contactPersonName: { type: String },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Brand", brandSchema);