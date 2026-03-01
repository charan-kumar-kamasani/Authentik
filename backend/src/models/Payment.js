const mongoose = require('mongoose');

const paymentChargeSchema = new mongoose.Schema({
    name:  { type: String },
    type:  { type: String, enum: ['percentage', 'flat'] },
    value: { type: Number },
    amount: { type: Number }, // calculated
}, { _id: false });

const paymentSchema = new mongoose.Schema({
    companyId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    creditTransactionId:  { type: mongoose.Schema.Types.ObjectId, ref: 'CreditTransaction', default: null },
    type:                 { type: String, enum: ['plan', 'topup'], required: true },
    planId:               { type: mongoose.Schema.Types.ObjectId, ref: 'PricePlan', default: null },
    quantity:             { type: Number, default: 0 }, // for topup

    baseAmount:           { type: Number, required: true },
    gstPercentage:        { type: Number, default: 0 },
    gstAmount:            { type: Number, default: 0 },
    additionalCharges:    [paymentChargeSchema],
    couponCode:           { type: String, default: null },
    couponDiscount:       { type: Number, default: 0 },
    finalAmount:          { type: Number, required: true },

    // PhonePe fields
    merchantOrderId:      { type: String, unique: true, sparse: true },
    phonePeTransactionId: { type: String, default: null },
    redirectUrl:          { type: String, default: null },

    status:               { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    performedBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
