const mongoose = require('mongoose');

// Individual field configuration
const fieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
  },
  fieldLabel: {
    type: String,
    required: true,
  },
  fieldType: {
    type: String,
    enum: ['text', 'number', 'dropdown', 'file', 'image', 'textarea', 'date', 'email', 'phone'],
    required: true,
  },
  isMandatory: {
    type: Boolean,
    default: false,
  },
  options: [{
    type: String,
  }], // For dropdown fields
  placeholder: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
  validation: {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String,
  },
  isQuantity: {
    type: Boolean,
    default: false,
  },
}, { _id: true });

// Variant configuration (for repeatable variant fields like Color, Size, Model)
const variantSchema = new mongoose.Schema({
  variantName: {
    type: String,
    required: true, // e.g., "Color", "Size", "Model/Series"
  },
  variantLabel: {
    type: String,
    required: true, // Display label
  },
  inputType: {
    type: String,
    enum: ['color', 'text', 'dropdown'],
    default: 'text',
  },
  options: [{
    type: String,
  }], // For dropdown type
  order: {
    type: Number,
    default: 0,
  },
}, { _id: true });

// Main form configuration (Global for all companies)
const formConfigSchema = new mongoose.Schema({
  isGlobal: {
    type: Boolean,
    default: true, // This is a global config for all companies
  },
  formName: {
    type: String,
    default: 'QR Creation Form',
  },
  description: {
    type: String,
    default: '',
  },
  customFields: [fieldSchema],
  // Variant types (repeatable fields like Color, Size, Model)
  variants: [variantSchema],
  // Static fields are always present: brand, mfdOn, bestBefore (these calculate expiryDate)
  staticFields: {
    brand: {
      enabled: { type: Boolean, default: true },
      isMandatory: { type: Boolean, default: true },
    },
    mfdOn: {
      enabled: { type: Boolean, default: true },
      isMandatory: { type: Boolean, default: true },
    },
    bestBefore: {
      enabled: { type: Boolean, default: true },
      isMandatory: { type: Boolean, default: true },
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Static variables for internal caching to boost performance and prevent N+1 DB calls
let _cachedConfig = null;
let _cacheExpiry = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

// Static method to get global form config
formConfigSchema.statics.getGlobalFormConfig = async function() {
  const now = Date.now();
  
  // Use cached version if it hasn't expired
  if (_cachedConfig && now < _cacheExpiry) {
    return _cachedConfig;
  }

  let config = await this.findOne({ isGlobal: true, isActive: true });
  if (!config) {
    // Return default config if none exists
    config = {
      isGlobal: true,
      formName: 'QR Creation Form',
      customFields: [],
      staticFields: {
        brand: { enabled: true, isMandatory: true },
        mfdOn: { enabled: true, isMandatory: true },
        bestBefore: { enabled: true, isMandatory: true },
      },
      variants: []
    };
  }

  // Update internal cache
  _cachedConfig = config;
  _cacheExpiry = now + CACHE_TTL;
  
  return config;
};

module.exports = mongoose.model('FormConfig', formConfigSchema);
