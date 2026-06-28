const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const StockRequest = require('../models/StockRequest');
const BlankQr = require('../models/BlankQr');
const Company = require('../models/Company');

// @route   POST /api/stock-requests
// @desc    Create a new stock request
// @access  Company/Authorizer
router.post('/', protect, authorize('company', 'authorizer', 'admin'), async (req, res) => {
  try {
    const { quantity, notes } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const companyId = req.user.companyId || req.user.company;
    if (!companyId) {
      return res.status(400).json({ error: 'User does not belong to a company' });
    }

    const request = await StockRequest.create({
      companyId,
      requestedBy: req.user._id,
      quantity,
      notes,
      amount: quantity * 1 // Default pricing: 1 Rs per QR
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Create Stock Request Error:', error);
    res.status(500).json({ error: 'Failed to create stock request' });
  }
});

// @route   GET /api/stock-requests/stats
// @desc    Get QR stock statistics for the logged-in user's company
// @access  Company/Authorizer
router.get('/stats', protect, async (req, res) => {
  try {
    const companyId = req.user.companyId || req.user.company;
    if (!companyId) {
      return res.status(400).json({ error: 'User does not belong to a company' });
    }

    const total = await BlankQr.countDocuments({ assignedToCompany: companyId });
    const used = await BlankQr.countDocuments({ assignedToCompany: companyId, isAssigned: true });
    const available = await BlankQr.countDocuments({ assignedToCompany: companyId, isAssigned: false, isBlocked: false });

    res.json({ total, used, available });
  } catch (error) {
    console.error('Get Stock Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch stock statistics' });
  }
});

// @route   GET /api/stock-requests
// @desc    Get stock requests (filtered by company for non-superadmins)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'superadmin') {
      filter.companyId = req.user.companyId || req.user.company;
    }
    
    console.log("Stock Request GET Filter:", filter);

    const requests = await StockRequest.find(filter)
      .populate('companyId', 'companyName')
      .populate('requestedBy', 'name email')
      .populate('fulfilledBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get Stock Requests Error:', error);
    res.status(500).json({ error: 'Failed to fetch stock requests' });
  }
});

// @route   PUT /api/stock-requests/:id/status
// @desc    Update stock request status (logistics workflow)
// @access  Superadmin
router.put('/:id/status', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Approved", "Preparing for Dispatch", "Dispatched"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status update' });
    }

    const request = await StockRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }

    // Ensure payment is completed before dispatching
    if (["Preparing for Dispatch", "Dispatched"].includes(status) && request.paymentStatus !== "paid") {
      return res.status(400).json({ error: 'Cannot dispatch unpaid stock requests. Ensure payment is completed first.' });
    }

    request.status = status;
    request.fulfilledBy = req.user._id;
    await request.save();

    res.json({ message: `Status updated to ${status}`, request });
  } catch (error) {
    console.error('Update Stock Request Status Error:', error);
    res.status(500).json({ error: 'Failed to update stock request status' });
  }
});

// @route   PUT /api/stock-requests/:id/update-amount
// @desc    Update stock request payment amount
// @access  Superadmin
router.put('/:id/update-amount', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount === undefined || amount < 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const request = await StockRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }

    if (request.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Cannot update amount for a paid request' });
    }

    request.amount = amount;
    await request.save();

    res.json({ message: 'Payment amount updated', request });
  } catch (error) {
    console.error('Update Stock Request Amount Error:', error);
    res.status(500).json({ error: 'Failed to update amount' });
  }
});

// @route   PUT /api/stock-requests/:id/receive
// @desc    Receive a stock request (assigns physical QRs)
// @access  Company/Authorizer
router.put('/:id/receive', protect, async (req, res) => {
  try {
    const request = await StockRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }
    
    // Only allow company/authorizer to receive
    if (req.user.role === 'superadmin') {
      return res.status(403).json({ error: 'Superadmin cannot receive stock requests for a company.' });
    }

    const companyId = req.user.companyId || req.user.company;
    if (request.companyId.toString() !== companyId.toString()) {
      return res.status(403).json({ error: 'Not authorized to receive this request' });
    }

    if (request.status !== 'Dispatched') {
      return res.status(400).json({ error: `Cannot receive a request that is currently ${request.status}. It must be Dispatched first.` });
    }

    const qty = request.quantity;

    // Find `qty` unassigned, unblocked, company-less QRs
    const unassignedQrs = await BlankQr.find({
      isAssigned: false,
      isBlocked: false,
      assignedToCompany: null,
    }).limit(qty).select('_id');

    if (unassignedQrs.length < qty) {
      return res.status(400).json({ 
        error: `Not enough unassigned global QRs. Requested: ${qty}, Available: ${unassignedQrs.length}` 
      });
    }

    const qrIds = unassignedQrs.map(qr => qr._id);

    // Assign QRs to the company
    await BlankQr.updateMany(
      { _id: { $in: qrIds } },
      { $set: { assignedToCompany: companyId } }
    );

    // Sync company qrCredits cache
    const unassignedForCompanyCount = await BlankQr.countDocuments({
      assignedToCompany: companyId,
      isAssigned: false,
      isBlocked: false
    });
    await Company.findByIdAndUpdate(companyId, { qrCredits: unassignedForCompanyCount });

    // Update Request Status
    request.status = 'Received';
    request.fulfilledBy = req.user._id;
    await request.save();

    res.json({ message: 'Request received and QRs successfully assigned', request });
  } catch (error) {
    console.error('Fulfill Stock Request Error:', error);
    res.status(500).json({ error: 'Failed to fulfill stock request' });
  }
});

// @route   PUT /api/stock-requests/:id/reject
// @desc    Reject a stock request
// @access  Superadmin
router.put('/:id/reject', protect, authorize('superadmin'), async (req, res) => {
  try {
    const request = await StockRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ error: `Cannot reject a request that is already ${request.status}` });
    }

    request.status = 'Rejected';
    request.fulfilledBy = req.user._id;
    if (req.body.notes) {
      request.notes = (request.notes ? request.notes + '\n' : '') + `Rejection Reason: ${req.body.notes}`;
    }
    await request.save();

    res.json({ message: 'Request rejected', request });
  } catch (error) {
    console.error('Reject Stock Request Error:', error);
    res.status(500).json({ error: 'Failed to reject stock request' });
  }
});

// @route   GET /api/stock-requests/usage
// @desc    Get QR usage history
// @access  Private
router.get('/usage', protect, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const filter = {
       qrCodesGenerated: true,
       qrGeneratedCount: { $gt: 0 }
    };
    
    if (req.user.role !== 'superadmin') {
      const compId = req.user.companyId || req.user.company;
      if (!compId) {
         return res.status(400).json({ error: 'User does not belong to a company' });
      }
      filter.$or = [
         { companyId: compId },
         { company: compId }
      ];
    }

    const usage = await Order.find(filter)
      .select('orderId productName brand quantity qrGeneratedCount startSerialNumber endSerialNumber createdAt status createdBy history')
      .populate('company', 'companyName')
      .populate('companyId', 'companyName')
      .populate('createdBy', 'name email role')
      .populate('history.changedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(usage);
  } catch (error) {
    console.error('Get QR Usage Error:', error);
    res.status(500).json({ error: 'Failed to fetch usage history' });
  }
});

module.exports = router;
