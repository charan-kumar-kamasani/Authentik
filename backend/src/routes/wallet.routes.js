const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const Scan = require('../models/Scan');
const Order = require('../models/Order');

// Get Wallet Balance
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance loyaltyPoints');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ 
      balance: user.walletBalance || 0,
      loyaltyPoints: user.loyaltyPoints || 0
    });
  } catch (err) {
    console.error('Wallet balance error:', err);
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
});

// Get Wallet Transactions History
router.get('/transactions', protect, async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ userId: req.user._id })
      .populate('scanId', 'productName qrCode')
      .populate('orderId', 'productName brand')
      .sort({ createdAt: -1 })
      .lean();
    res.json(transactions);
  } catch (err) {
    console.error('Wallet transactions error:', err);
    res.status(500).json({ error: 'Failed to fetch wallet transactions' });
  }
});

module.exports = router;
