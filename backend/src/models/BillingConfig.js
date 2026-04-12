const mongoose = require('mongoose');

const billingConfigSchema = new mongoose.Schema({
    monthlyMultiplier:   { type: Number, default: 1.3,  min: 0.1 },
    quarterlyMultiplier: { type: Number, default: 1.1,  min: 0.1 },
    yearlyMultiplier:    { type: Number, default: 1.0,  min: 0.1 },
    monthlyLabel:        { type: String, default: 'Monthly' },
    quarterlyLabel:      { type: String, default: 'Quarterly' },
    yearlyLabel:         { type: String, default: 'Yearly' },
    qrPricingBrackets: [{
        minQuantity: { type: Number, required: true },
        maxQuantity: { type: Number }, // If null, means max infinity
        pricePerQr:  { type: Number, required: true }
    }]
}, { timestamps: true });

// Singleton pattern — only one config doc ever
billingConfigSchema.statics.getConfig = async function () {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

module.exports = mongoose.model('BillingConfig', billingConfigSchema);
