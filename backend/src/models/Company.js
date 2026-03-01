const mongoose = require('mongoose');

// Company model: contains the detailed company-level information (previously held in Brand)
const companySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    officialEmails: [{ type: String }], // verified official email IDs
    legalEntity: { type: String },
    companyWebsite: { type: String },
    industry: { type: String },
    category: { type: String },
    country: { type: String },
    city: { type: String },
    cinGst: { type: String }, // GST number
    registerOfficeAddress: { type: String, required: true },
    courierAddress: { type: String, required: true },
    dispatchAddress: { type: String },
    email: { type: String, required: true }, // support mail
    supportNumber: { type: String, required: true },
    phoneNumber: { type: String, required: true }, // contact number
    contactPersonName: { type: String },
    authorizerEmails: [{ type: String }], // authorizer email IDs
    creatorEmails: [{ type: String }], // creator email IDs
    qrCredits: { type: Number, default: 0 }, // available QR credits balance
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
