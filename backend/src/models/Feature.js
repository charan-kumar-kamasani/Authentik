const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ['boolean', 'string', 'number'], default: 'boolean' },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Feature', featureSchema);
