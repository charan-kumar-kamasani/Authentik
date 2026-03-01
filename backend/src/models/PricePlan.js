const mongoose = require('mongoose');

const planFeatureSchema = new mongoose.Schema({
    featureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Feature', required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const cyclePricingSchema = new mongoose.Schema({
    pricePerQr: { type: Number, default: 0 },
    validity:   { type: String,  default: '-' },
    saveText:   { type: String,  default: '-' },
}, { _id: false });

const pricePlanSchema = new mongoose.Schema({
    name:          { type: String, required: true, unique: true },
    price:         { type: Number, required: true },
    pricePerQr:    { type: Number, required: true },
    qrCodes:       { type: String },
    minQrPerOrder: { type: String },
    planValidity:  { type: String },
    isPopular:     { type: Boolean, default: false },
    isTrial:       { type: Boolean, default: false },
    saveText:      { type: String },
    pricing: {
        monthly:   { type: cyclePricingSchema, default: () => ({}) },
        quarterly: { type: cyclePricingSchema, default: () => ({}) },
        yearly:    { type: cyclePricingSchema, default: () => ({}) },
    },
    features: [planFeatureSchema]
}, { timestamps: true });

module.exports = mongoose.model('PricePlan', pricePlanSchema);
