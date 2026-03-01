const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    type: {
      type: String,
      enum: ['purchase_plan', 'purchase_topup', 'spend', 'refund', 'admin_grant'],
      required: true,
    },
    // +ve for credit added, -ve for credit spent
    amount: { type: Number, required: true },
    // Balance after this transaction
    balanceAfter: { type: Number, required: true },
    // For purchases
    unitPrice: { type: Number }, // price per QR (e.g. 5)
    totalPaid: { type: Number }, // total ₹ paid
    planName: { type: String },  // if bought a plan
    // For spends
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    // Who performed this
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);
