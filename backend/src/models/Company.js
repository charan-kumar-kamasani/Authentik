const mongoose = require('mongoose');

// Company model: contains the detailed company-level information (previously held in Brand)
const companySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    legalEntity: { type: String, required: true },
    companyWebsite: { type: String },
    industry: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    cinGst: { type: String, required: true }, // CIN/GST
    registerOfficeAddress: { type: String, required: true },
    dispatchAddress: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    contactPersonName: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
