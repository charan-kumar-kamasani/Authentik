const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Company = require('../models/Company');
const CreditTransaction = require('../models/CreditTransaction');
const { generateQrPdf } = require('../utils/pdfGenerator');
const { sendOrderStatusEmail } = require('../utils/emailService');

// Helper function to get all relevant users for email notifications
const getNotificationRecipients = async (order) => {
  const recipients = new Set();
  
  try {
    // Add creator
    const creator = await User.findById(order.createdBy);
    if (creator && creator.email) recipients.add(creator.email);
    
    // Add company/brand authorizers
    const brand = await Brand.findById(order.brandId);
    if (brand && brand.email) recipients.add(brand.email);

    // Find all authorizers for this brand
    const authorizers = await User.find({ 
      brandId: order.brandId, 
      role: 'authorizer',
      email: { $exists: true, $ne: null }
    });
    authorizers.forEach(auth => {
      if (auth.email) recipients.add(auth.email);
    });
    
    // Add all super admins
    const admins = await User.find({ 
      role: { $in: ['admin', 'superadmin'] },
      email: { $exists: true, $ne: null }
    });
    admins.forEach(admin => {
      if (admin.email) recipients.add(admin.email);
    });
    
  } catch (error) {
    console.error('Error getting recipients:', error);
  }
  
  return Array.from(recipients);
};

// 1. CREATE ORDER (Creator only)
router.post('/', protect, authorize('creator', 'company'), async (req, res) => {
  try {
    const { productName, brand, batchNo, manufactureDate, expiryDate, quantity, description } = req.body;
    
    // Determine the brandId (preferred) or fallback to company owner
    let brandId = req.body.brandId || req.user.brandId || null;
    if (req.user.role === 'company') {
      brandId = req.user.brandId || req.user._id;
    }

    if (!brandId) {
      return res.status(400).json({ message: 'User is not linked to a brand' });
    }

    // Generate unique Order ID
    const count = await Order.countDocuments();
    const orderId = `ORD-${Date.now()}-${count + 1}`;

    const order = new Order({
      orderId,
      productName,
      brand: brand || 'Unknown',
      batchNo: batchNo || `BATCH-${orderId}`,
      manufactureDate,
      expiryDate,
      quantity,
      description,
      createdBy: req.user._id,
      brandId,
      status: 'Pending Authorization',
      history: [{
        status: 'Pending Authorization',
        changedBy: req.user._id,
        role: req.user.role,
        comment: 'Order created and awaiting authorization'
      }]
    });

    const createdOrder = await order.save();
    
    // Send email notifications
    const recipients = await getNotificationRecipients(createdOrder);
    await sendOrderStatusEmail(recipients, {
      orderId: createdOrder.orderId,
      productName: createdOrder.productName,
      brand: createdOrder.brand,
      quantity: createdOrder.quantity,
      status: createdOrder.status,
      changedBy: req.user.name || req.user.email
    }, `New QR order created by ${req.user.name || req.user.email}`);
    
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 2. GET ORDERS
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    const { status } = req.query;

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Role-based filtering
    if (['admin', 'superadmin'].includes(req.user.role)) {
      // Super Admin sees all
    } else if (req.user.role === 'creator') {
        // Creator sees their own orders OR orders for their company
        // If companyId exists, use it, otherwise fall back to createdBy
        if (req.user.brandId) {
             query.brandId = req.user.brandId;
        } else {
             query.createdBy = req.user._id;
        }
    } else if (['company', 'authorizer'].includes(req.user.role)) {
      const brandId = req.user.role === 'company' ? (req.user.brandId || req.user._id) : req.user.brandId;
      if (brandId) {
          query.brandId = brandId;
      } else {
          // Fallback: If authorizer has no companyId, they might not see anything.
          // In a real app, we'd fix the user creation. For now, strict.
          return res.status(403).json({ message: 'User not linked to a brand' });
      }
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const orders = await Order.find(query)
      .populate('createdBy', 'name email role')
      .populate('brandId', 'brandName')
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 3. GET SINGLE ORDER
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('brandId', 'brandName')
      .populate({
        path: 'history.changedBy',
        select: 'name email role'
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
  const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
  const userBrandId = req.user.brandId || (req.user.role === 'company' ? req.user._id : null);
  const hasAccess = isAdmin || (userBrandId && order.brandId && order.brandId._id.toString() === userBrandId.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 4. AUTHORIZE ORDER (Authorizer or Company)
router.put('/:id/authorize', protect, authorize('company', 'authorizer'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify ownership by brand only
    const userBrandId = req.user.brandId || (req.user.role === 'company' ? req.user._id : null);
    if (!order.brandId || !userBrandId || order.brandId.toString() !== userBrandId.toString()) {
      return res.status(403).json({ message: 'Not authorized for this order' });
    }

    if (order.status !== 'Pending Authorization') {
      return res.status(400).json({ message: 'Order cannot be authorized in its current state' });
    }

    // --- Credit check & deduction ---
    const brand = await Brand.findById(order.brandId);
    if (!brand || !brand.companyId) {
      return res.status(400).json({ message: 'Brand or company not found for this order' });
    }
    const company = await Company.findById(brand.companyId);
    if (!company) {
      return res.status(400).json({ message: 'Company not found' });
    }
    const required = order.quantity || 0;
    const available = company.qrCredits || 0;
    if (available < required) {
      const shortfall = required - available;
      return res.status(400).json({
        insufficientCredits: true,
        required,
        available,
        shortfall,
        topupCostPerQr: 5,
        topupTotalCost: shortfall * 5,
        companyId: company._id,
        companyName: company.companyName,
        message: `Insufficient QR credits. Need ${required}, have ${available}. ${shortfall} more needed.`
      });
    }

    // Deduct credits
    company.qrCredits -= required;
    await company.save({ validateModifiedOnly: true });

    // Record spend transaction
    await CreditTransaction.create({
      companyId: company._id,
      type: 'spend',
      amount: -required,
      balanceAfter: company.qrCredits,
      orderId: order._id,
      performedBy: req.user._id,
      note: `Authorized order ${order.orderId} — ${required} QR credits spent`
    });
    // --- End credit check ---

    order.status = 'Authorized';
    order.history.push({
      status: 'Authorized',
      changedBy: req.user._id,
      role: req.user.role,
      comment: 'Order authorized and sent to Super Admin for processing'
    });

    await order.save();
    
    // Send email notifications
    const recipients = await getNotificationRecipients(order);
    await sendOrderStatusEmail(recipients, {
      orderId: order.orderId,
      productName: order.productName,
      brand: order.brand,
      quantity: order.quantity,
      status: order.status,
      changedBy: req.user.name || req.user.email
    }, `Order authorized by ${req.user.name || req.user.email}. Awaiting Super Admin processing.`);
    
    res.json(order);
  } catch (error) {
    console.error('Authorize order error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 5. PROCESS ORDER & GENERATE QRs (Super Admin)
router.put('/:id/process', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('brandId').populate('company');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Authorized') {
      return res.status(400).json({ message: 'Order must be authorized first' });
    }

    // Update status to processing
    order.status = 'Order Processing';
    order.history.push({
      status: 'Order Processing',
      changedBy: req.user._id,
      role: req.user.role,
      comment: 'Generating QR codes...'
    });

    await order.save();

    // GENERATE QR CODES
    const productsToCreate = [];
    const qty = order.quantity;
    const brandName = order.brand;
    
    // Find last sequence number for this brand
    const lastProduct = await Product.findOne({ brand: brandName }).sort({ sequence: -1 });
    let startSeq = lastProduct && lastProduct.sequence ? lastProduct.sequence + 1 : 1;

    // Try to resolve Brand record for this order if available
    const brandDoc = await Brand.findOne({ brandName: brandName });

    for (let i = 0; i < qty; i++) {
      const currentSeq = startSeq + i;
      const seqString = currentSeq.toString().padStart(6, '0');
      const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const qrCode = `${brandName}-${seqString}-${order.orderId}-${uniqueSuffix}`;
      
      productsToCreate.push({
        qrCode,
        productName: order.productName,
        brand: brandName,
        brandId: brandDoc ? brandDoc._id : null,
        batchNo: order.batchNo,
        manufactureDate: order.manufactureDate,
        expiryDate: order.expiryDate,
        quantity: 1,
        sequence: currentSeq,
        orderId: order._id,
        isActive: false, // QRs are inactive until authorizer receives
        createdBy: req.user._id
      });
    }
    
    await Product.insertMany(productsToCreate);
    
    // Update order
    order.qrCodesGenerated = true;
    order.qrGeneratedCount = qty;
    await order.save();

    // Send email notifications
    const recipients = await getNotificationRecipients(order);
    await sendOrderStatusEmail(recipients, {
      orderId: order.orderId,
      productName: order.productName,
      brand: order.brand,
      quantity: order.quantity,
      status: order.status,
      changedBy: req.user.name || req.user.email
    }, `${qty} QR codes generated successfully.`);
    
    res.json({ 
      message: 'QR codes generated successfully', 
      order,
      qrCount: qty 
    });
  } catch (error) {
    console.error('Process order error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 6. MARK AS DISPATCHING (Super Admin)
router.put('/:id/dispatching', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Order Processing') {
      return res.status(400).json({ message: 'Order must be in processing state' });
    }

    order.status = 'Dispatching';
    order.history.push({
      status: 'Dispatching',
      changedBy: req.user._id,
      role: req.user.role,
      comment: 'Preparing order for dispatch'
    });

    await order.save();
    
    // Send email notifications
    const recipients = await getNotificationRecipients(order);
    await sendOrderStatusEmail(recipients, {
      orderId: order.orderId,
      productName: order.productName,
      brand: order.brand,
      quantity: order.quantity,
      status: order.status,
      changedBy: req.user.name || req.user.email
    }, `Order is being prepared for dispatch.`);
    
    res.json(order);
  } catch (error) {
    console.error('Dispatching order error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 7. DISPATCH ORDER (Super Admin)
router.put('/:id/dispatch', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { trackingNumber, courierName, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Dispatching') {
      return res.status(400).json({ message: 'Order must be in dispatching state' });
    }

    order.status = 'Dispatched';
    order.dispatchDetails = {
      trackingNumber: trackingNumber || 'N/A',
      courierName: courierName || 'N/A',
      notes,
      dispatchedDate: new Date()
    };
    
    order.history.push({
      status: 'Dispatched',
      changedBy: req.user._id,
      role: req.user.role,
      comment: `Dispatched via ${courierName || 'courier'}${trackingNumber ? ` - Tracking: ${trackingNumber}` : ''}`
    });

    await order.save();
    
    // Send email notifications
    const recipients = await getNotificationRecipients(order);
    await sendOrderStatusEmail(recipients, {
      orderId: order.orderId,
      productName: order.productName,
      brand: order.brand,
      quantity: order.quantity,
      status: order.status,
      changedBy: req.user.name || req.user.email
    }, `Order dispatched. ${trackingNumber ? `Tracking: ${trackingNumber}` : ''}`);
    
    res.json(order);
  } catch (error) {
    console.error('Dispatch order error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 8. MARK AS RECEIVED - FINAL STEP (Authorizer or Company) - ACTIVATES QRs
router.put('/:id/received', protect, authorize('company', 'authorizer'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify ownership by brand only
    const userBrandId = req.user.brandId || (req.user.role === 'company' ? req.user._id : null);
    if (!order.brandId || !userBrandId || order.brandId.toString() !== userBrandId.toString()) {
      return res.status(403).json({ message: 'Not authorized for this order' });
    }

    if (order.status !== 'Dispatched') {
      return res.status(400).json({ message: 'Order must be dispatched first' });
    }

    // ACTIVATE ALL QR CODES FOR THIS ORDER
    const updateResult = await Product.updateMany(
      { orderId: order._id },
      { $set: { isActive: true } }
    );

    order.status = 'Received';
    order.history.push({
      status: 'Received',
      changedBy: req.user._id,
      role: req.user.role,
      comment: `Order received and ${updateResult.modifiedCount} QR codes activated`
    });

    await order.save();
    
    // Send email notifications
    const recipients = await getNotificationRecipients(order);
    await sendOrderStatusEmail(recipients, {
      orderId: order.orderId,
      productName: order.productName,
      brand: order.brand,
      quantity: order.quantity,
      status: order.status,
      changedBy: req.user.name || req.user.email
    }, `✓ Order completed! ${updateResult.modifiedCount} QR codes are now ACTIVE.`);
    
    res.json({ 
      message: 'Order marked as received and QR codes activated',
      order,
      activatedQRs: updateResult.modifiedCount 
    });
  } catch (error) {
    console.error('Receive order error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 9. REJECT ORDER (Can be done by authorized users at various stages)
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Permission check
  const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
  const userBrandId = req.user.brandId || (req.user.role === 'company' ? req.user._id : null);
  const isCompanyStaff = ['company', 'authorizer'].includes(req.user.role) && (
               (userBrandId && order.brandId && order.brandId.toString() === userBrandId.toString())
               );

    if (!isAdmin && !isCompanyStaff) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Don't allow rejection of already received orders
    if (order.status === 'Received') {
      return res.status(400).json({ message: 'Cannot reject a completed order' });
    }

    order.status = 'Rejected';
    order.history.push({
      status: 'Rejected',
      changedBy: req.user._id,
      role: req.user.role,
      comment: reason || 'Order rejected'
    });

    await order.save();
    
    // Send email notifications
    const recipients = await getNotificationRecipients(order);
    await sendOrderStatusEmail(recipients, {
      orderId: order.orderId,
      productName: order.productName,
      brand: order.brand,
      quantity: order.quantity,
      status: order.status,
      changedBy: req.user.name || req.user.email
    }, `Order rejected. Reason: ${reason || 'Not specified'}`);
    
    res.json(order);
  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 10. DOWNLOAD PDF
router.get('/:id/download', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('brandId').populate('company');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only Super Admin/Admin can download. Already handled by middleware authorize
    
    if (!order.qrCodesGenerated) {
      return res.status(400).json({ message: 'QR codes not generated yet' });
    }
    
    // Find products for this order
    const products = await Product.find({ orderId: order._id }).sort({ sequence: 1 });
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'No QR codes found for this order' });
    }
    
    // Fetch the Brand document to get the logo URL
    const brandDoc = order.brandId ? await Brand.findById(order.brandId._id || order.brandId) : null;

    // Prepare options with order, brand, and company information
    const pdfOptions = {
      orderId: order.orderNumber || order._id.toString(),
      brand: order.brandName || brandDoc?.brandName || 'N/A',
      brandId: order.brandId || '',
      brandLogo: brandDoc?.brandLogo || '',
      company: order.companyName || 'N/A',
      companyName: order.companyName || 'N/A'
    };
    
    const pdfBase64 = await generateQrPdf(products, req.user.email || 'user', pdfOptions);
    res.json({ pdfBase64 });

  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 11. GET ORDER STATISTICS
router.get('/stats/summary', protect, async (req, res) => {
  try {
    let matchQuery = {};

    // Role-based filtering
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      const brandId = req.user.role === 'company' ? (req.user.brandId || req.user._id) : req.user.brandId;
      matchQuery.brandId = brandId;
    }

    const stats = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments(matchQuery);
    const totalQRs = await Order.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    res.json({
      totalOrders,
      totalQRs: totalQRs[0]?.total || 0,
      byStatus: stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
