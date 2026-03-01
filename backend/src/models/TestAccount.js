const mongoose = require('mongoose');

const testAccountSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true,
  },
  testAmount: {
    type: Number,
    required: true,
    min: 0.01,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Index for quick lookups
testAccountSchema.index({ companyId: 1, isActive: 1 });

// Static method to check if company is test account
testAccountSchema.statics.isTestAccount = async function(companyId) {
  const testAccount = await this.findOne({ companyId, isActive: true });
  return testAccount;
};

module.exports = mongoose.model('TestAccount', testAccountSchema);
