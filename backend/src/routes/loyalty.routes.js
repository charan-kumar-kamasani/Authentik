const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

// Get Loyalty & Cashback Dashboard Stats (Admin/Superadmin)
router.get('/dashboard-stats', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Not authorized to view loyalty stats' });
    }

    // Total cashbacks and points disbursed globally
    const orders = await Order.find({}).select('cashback loyalty');
    let totalCashbackFund = 0;
    let totalCashbackDisbursed = 0;
    let totalPointsFund = 0;
    let totalPointsDisbursed = 0;
    let activeSchemes = 0;

    orders.forEach(order => {
      if (order.cashback && order.cashback.isActive) {
        activeSchemes++;
        totalCashbackFund += (order.cashback.totalFund || 0);
        totalCashbackDisbursed += (order.cashback.disbursed || 0);
      }
      if (order.loyalty && order.loyalty.isActive) {
        activeSchemes++;
        totalPointsFund += (order.loyalty.totalPointsFund || 0);
        totalPointsDisbursed += (order.loyalty.pointsDisbursed || 0);
      }
    });

    // Recent Transactions
    const recentTransactions = await WalletTransaction.find({})
      .populate('userId', 'name mobile email profileImage')
      .populate('orderId', 'productName brand')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Top Earners Leaderboard (Points)
    const topPointsEarners = await User.find({ loyaltyPoints: { $gt: 0 } })
      .select('name mobile email profileImage loyaltyPoints')
      .sort({ loyaltyPoints: -1 })
      .limit(10)
      .lean();

    res.json({
      stats: {
        totalCashbackFund,
        totalCashbackDisbursed,
        totalPointsFund,
        totalPointsDisbursed,
        activeSchemes
      },
      recentTransactions,
      topPointsEarners
    });
  } catch (error) {
    console.error('Loyalty Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
