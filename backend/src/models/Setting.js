const mongoose = require('mongoose');

const additionalChargeSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    type:     { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    value:    { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
}, { _id: true });

const settingSchema = new mongoose.Schema({
    gstPercentage:     { type: Number, default: 18, min: 0, max: 100 },
    additionalCharges: [additionalChargeSchema],
}, { timestamps: true });

// Singleton pattern — only one settings doc ever
settingSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('Setting', settingSchema);
