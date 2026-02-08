const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const User = require('../models/User');
const { generateQrPdf } = require('../utils/pdfGenerator');
const Product = require('../models/Product');

// 1. CREATE ORDER (Creator only)
// POST /api/orders
router.post('/', protect, authorize('creator', 'company', 'authorizer'), async (req, res) => {
  try {
    const { productName, quantity, description } = req.body;
    
    // Determine the company ID
    let companyId = req.user.companyId; 
    // If the user IS the company, use their own ID
    if (req.user.role === 'company') {
        companyId = req.user._id;
    }

    if (!companyId && req.user.role !== 'company') {
        return res.status(400).json({ message: 'User is not linked to a company' });
    }

    // Generate a simple Order ID
    const count = await Order.countDocuments();
    const orderId = `ORD-${Date.now()}-${count + 1}`;

    const order = new Order({
      orderId,
      productName,
      quantity,
      description,
      createdBy: req.user._id,
      company: companyId,
      status: 'Pending Authorization',
      history: [{
        status: 'Pending Authorization',
        changedBy: req.user._id,
        role: req.user.role,
        comment: 'Order created'
      }]
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 2. GET ORDERS
// GET /api/orders
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    // Super Admin sees all
    if (['admin', 'superadmin'].includes(req.user.role)) {
      // no filter
    } 
    // Company, Authorizer, Creator see orders for their company
    else if (['company', 'authorizer', 'creator'].includes(req.user.role)) {
       const companyId = req.user.role === 'company' ? req.user._id : req.user.companyId;
       query.company = companyId;
    } else {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const orders = await Order.find(query)
      .populate('createdBy', 'name email')
      .populate('company', 'name')
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 3. AUTHORIZE ORDER (Company or Authorizer)
// PUT /api/orders/:id/authorize
router.put('/:id/authorize', protect, authorize('company', 'authorizer'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify company ownership
    const userCompanyId = req.user.role === 'company' ? req.user._id : req.user.companyId;
    if (order.company.toString() !== userCompanyId.toString()) {
        return res.status(403).json({ message: 'Not authorized for this order' });
    }

    if (order.status !== 'Pending Authorization') {
      return res.status(400).json({ message: 'Order cannot be authorized in its current state' });
    }

    order.status = 'Authorized';
    order.history.push({
      status: 'Authorized',
      changedBy: req.user._id,
      role: req.user.role,
      comment: 'Order Authorized'
    });

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 4. AUTHENTICK ACCEPT & PRINT (Super Admin)
// PUT /api/orders/:id/accept
router.put('/:id/accept', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate('company');
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      if (order.status !== 'Authorized') {
        return res.status(400).json({ message: 'Order needs to be authorized first' });
      }
  
      order.status = 'Accepted & Ready to Print';
      order.history.push({
        status: 'Accepted & Ready to Print',
        changedBy: req.user._id, // Admin
        role: 'admin',
        comment: 'Accepted for printing'
      });
      
      // GENERATE QR CODES HERE
      // We generate 'quantity' number of products linked to this order
      const productsToCreate = [];
      const qty = order.quantity;
      const brandName = order.company ? order.company.name || 'Brand' : 'Brand';
      
      // Determine sequence (this logic mimics admin.routes.js)
      // Note: This might be slow for large quantities. Optimization needed for real prod.
      const lastProduct = await Product.findOne({ brand: brandName }).sort({ sequence: -1 });
      let startSeq = lastProduct && lastProduct.sequence ? lastProduct.sequence + 1 : 1;

      for(let i=0; i<qty; i++) {
        const currentSeq = startSeq + i;
        const seqString = currentSeq.toString().padStart(4, '0');
        const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const qrCode = `${brandName}-${seqString}-ORD${order.orderId}-${uniqueSuffix}`;
        
         productsToCreate.push({
            qrCode,
            productName: order.productName,
            brand: brandName,
            batchNo: `ORD-${order.orderId}`,
            // manufactureDate: order.createdAt, // Optional
            // expiryDate: ..., // Optional
            quantity: 1,
            sequence: currentSeq,
            createdBy: req.user._id // Admin created the QRs
         });
      }
      
      const createdProducts = await Product.insertMany(productsToCreate);
      
      // Save product references to order if needed, but array of IDs might be huge
      // order.qrCodes = createdProducts.map(p => p.qrCode); 

      await order.save();
      
      // Generate PDF logic could be here or separate download endpoint.
      // For now, we update status.
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  });

// DOWNLOAD PDF
router.get('/:id/download', protect, async (req, res) => {
    try {
         const order = await Order.findById(req.params.id).populate('company');
         if (!order) return res.status(404).json({message: 'Not found'});
         
         // Helper to check access
         const isAudit = ['admin'].includes(req.user.role);
         const isCompany = req.user.role === 'company' && order.company.toString() === req.user._id.toString();
         const isStaff = ['authorizer', 'creator'].includes(req.user.role) && req.user.companyId && order.company.toString() === req.user.companyId.toString();
         
         if (!isAudit && !isCompany && !isStaff) {
             return res.status(403).json({message: 'Not authorized'});
         }
         
         if (!['Dispatched - Pending Activation', 'Activated'].includes(order.status) && req.user.role !== 'admin') {
             return res.status(400).json({message: 'PDF not available yet'});
         }

         // Find products for this order
         const batchNo = `ORD-${order.orderId}`;
         const products = await Product.find({ batchNo: batchNo });
         
         if (products.length === 0) {
             return res.status(404).json({message: 'No QR codes generated for this order'});
         }
         
         const pdfBase64 = await generateQrPdf(products, req.user.email);
         res.json({ pdfBase64 });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// 5. DISPATCH (Super Admin)
// PUT /api/orders/:id/dispatch
router.put('/:id/dispatch', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
      const { trackingNumber, notes } = req.body;
      const order = await Order.findById(req.params.id);
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      order.status = 'Dispatched - Pending Activation';
      order.dispatchDetails = {
          trackingNumber,
          notes,
          dispatchedDate: new Date()
      };
      
      order.history.push({
        status: 'Dispatched - Pending Activation',
        changedBy: req.user._id, 
        role: 'admin',
        comment: 'Order dispatched'
      });
  
      await order.save();
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// 6. ACTIVATE (Authorizer or Company)
// PUT /api/orders/:id/activate
router.put('/:id/activate', protect, authorize('company', 'authorizer'), async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      const userCompanyId = req.user.role === 'company' ? req.user._id : req.user.companyId;
      if (order.company.toString() !== userCompanyId.toString()) {
          return res.status(403).json({ message: 'Not authorized for this order' });
      }

      if (order.status !== 'Dispatched - Pending Activation') {
          return res.status(400).json({ message: 'Order is not pending activation' });
      }
  
      order.status = 'Activated';
      order.history.push({
        status: 'Activated',
        changedBy: req.user._id,
        role: req.user.role,
        comment: 'Order Activated'
      });
  
      await order.save();
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Reject Order
router.put('/:id/reject', protect, async (req, res) => {
    // Logic for rejection valid for multiple roles at different stages
    // Keep it simple for now
    try {
        const order = await Order.findById(req.params.id);
        if(!order) return res.status(404).json({message: 'Not found'});
        
        // Add permission checks here based on role and state (omitted for brevity)

        order.status = 'Rejected / Cancelled';
        order.history.push({
            status: 'Rejected / Cancelled',
            changedBy: req.user._id,
            role: req.user.role,
            comment: req.body.reason || 'Rejected'
        });
        await order.save();
        res.json(order);
    } catch(e) {
        res.status(500).json({message: e.message});
    }
});


module.exports = router;
