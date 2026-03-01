const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
    description:   { type: String, default: '' },
    discountType:  { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    discountValue: { type: Number, required: true, min: 0 },
    minAmount:     { type: Number, default: 0, min: 0 },
    maxDiscount:   { type: Number, default: 0, min: 0 }, // 0 = no cap
    expiryDate:    { type: Date, default: null },
    usageLimit:    { type: Number, default: 0, min: 0 }, // 0 = unlimited
    usedCount:     { type: Number, default: 0, min: 0 },
    isActive:      { type: Boolean, default: true },
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Helper: check if coupon is valid
couponSchema.methods.isValid = function (baseAmount) {
    if (!this.isActive) return { valid: false, reason: 'Coupon is inactive' };
    if (this.expiryDate && new Date() > this.expiryDate) return { valid: false, reason: 'Coupon has expired' };
    if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) return { valid: false, reason: 'Coupon usage limit reached' };
    if (baseAmount < this.minAmount) return { valid: false, reason: `Minimum amount ₹${this.minAmount} required` };
    return { valid: true };
};

// Helper: calculate discount
couponSchema.methods.calculateDiscount = function (baseAmount) {
    let discount = 0;
    if (this.discountType === 'percentage') {
        discount = (baseAmount * this.discountValue) / 100;
    } else {
        discount = this.discountValue;
    }
    // Apply max cap if set
    if (this.maxDiscount > 0 && discount > this.maxDiscount) {
        discount = this.maxDiscount;
    }
    // Discount cannot exceed base amount
    if (discount > baseAmount) discount = baseAmount;
    return Math.round(discount * 100) / 100;
};

module.exports = mongoose.model('Coupon', couponSchema);
