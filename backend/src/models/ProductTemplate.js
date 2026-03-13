const mongoose = require('mongoose');

const productTemplateSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  productImage: {
    type: String, // Cloudinary URL
    default: null
  },
  productInfo: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  isAuthorized: {
    type: Boolean,
    default: false
  },
  authorizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('ProductTemplate', productTemplateSchema);
