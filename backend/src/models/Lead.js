const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true, default: '' },
  company: { type: String, trim: true, default: '' },
  requirements: { type: String, trim: true, default: '' },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new'
  },
  notes: { type: String, default: '' },
  source: { type: String, default: 'website' }
}, { timestamps: true });

leadSchema.index({ email: 1 });
leadSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
