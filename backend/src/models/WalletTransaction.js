const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: {
    type: String,
    enum: ['INR', 'POINTS'],
    default: 'INR'
  },
  type: { 
    type: String, 
    enum: ['cashback_earned', 'points_earned', 'points_redeemed'], 
    required: true 
  },
  scanId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Scan',
    default: null
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  description: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
