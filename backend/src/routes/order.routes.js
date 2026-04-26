const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Company = require('../models/Company');
const CreditTransaction = require('../models/CreditTransaction');
const ProductCoupon = require('../models/ProductCoupon');
const { generateQrPdf, generateQrPdfStream } = require('../utils/pdfGenerator');
const { sendOrderStatusEmail } = require('../utils/emailService');
const { calculateQrPrice } = require('../utils/pricing');

// ... (existing code)

// NEW: GET ORDER PRICE DETAILS
router.get('/:id/price', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Calculate based on current quantity
    const pricing = await calculateQrPrice(order.quantity);
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to get all relevant users for email notifications
const getNotificationRecipients = async (order) => {
  const recipients = new Set();
  
  try {
    // Add creator
    const creator = await User.findById(order.createdBy).lean();
    if (creator && creator.email) recipients.add(creator.email);
    
    // Add company/brand authorizers
    const brand = await Brand.findById(order.brandId).lean();
    if (brand && brand.email) recipients.add(brand.email);

    // Find all authorizers for this brand
    const authorizers = await User.find({ 
      brandId: order.brandId, 
      role: 'authorizer',
      email: { $exists: true, $ne: null }
    }).lean();
    authorizers.forEach(auth => {
      if (auth.email) recipients.add(auth.email);
    });
    
    // Add all super admins
    const admins = await User.find({ 
      role: { $in: ['admin', 'superadmin'] },
      email: { $exists: true, $ne: null }
    }).lean();
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
    const { 
      productName, 
      brand, 
      batchNo, 
      manufactureDate, 
      expiryDate, 
      quantity, 
      description,
      productInfo,
      mfdOn,
      bestBefore,
      calculatedExpiryDate,
      dynamicFields,
      variants,
      productImage
    } = req.body;

    let quantityFinal = req.body.quantity;

    // Fallback: if quantity is missing at top level, search in dynamicFields
    if ((quantityFinal === undefined || quantityFinal === null || quantityFinal === 0) && dynamicFields) {
      // 1. Look for common names
      quantityFinal = dynamicFields.quantity || dynamicFields.qrQuantity || dynamicFields.QRQuantity;
      
      // 2. If still missing, look for any field containing "quantity" in its key
      if (!quantityFinal) {
        const qtyKey = Object.keys(dynamicFields).find(k => k.toLowerCase().includes('quantity'));
        if (qtyKey) quantityFinal = dynamicFields[qtyKey];
      }
    }

    const quantityNumber = Number(quantityFinal) || 0;

    // Hard minimum: 1000 units required
    if (quantityNumber < 1000) {
      return res.status(400).json({
        message: `Minimum order quantity is 1000 units. You entered ${quantityNumber}.`,
        minRequired: 1000
      });
    }

    // Description word limit: 200 words max
    const descText = (req.body.description || req.body.productInfo || '').trim();
    if (descText) {
      const wordCount = descText.split(/\s+/).filter(Boolean).length;
      if (wordCount > 200) {
        return res.status(400).json({
          message: `Product description cannot exceed 200 words. Current: ${wordCount} words.`,
          maxWords: 200,
          currentWords: wordCount
        });
      }
    }
    
    // Determine the brandId (preferred) or fallback to company owner
    let brandId = req.body.brandId || (req.user.brandId?._id || req.user.brandId) || null;
    if (req.user.role === 'company' && !brandId) {
      brandId = req.user._id;
    }

    if (!brandId) {
      return res.status(400).json({ message: 'User is not linked to a brand' });
    }

    // Generate unique Order ID
    const count = await Order.countDocuments();
    const orderId = `ORD-${Date.now()}-${count + 1}`;

    // Server-side: enforce plan minimum if a planId is provided or if company has an active plan
    let effectivePlanId = req.body.planId;
    if (!effectivePlanId && req.user.companyId) {
      try {
        const company = await Company.findById(req.user.companyId);
        if (company && company.planId) {
          effectivePlanId = company.planId;
        }
      } catch (e) {
        console.warn('Failed to fetch company plan for validation:', e.message);
      }
    }

    if (effectivePlanId) {
      try {
        const PricePlan = require('../models/PricePlan');
        const plan = await PricePlan.findById(effectivePlanId);
        if (plan) {
          const minStr = plan.minQrPerOrder || plan.minQr || '';
          const min = Number(String(minStr).replace(/[^\d]/g, '') || 0);
          if (min > 0 && quantityNumber < min) {
            return res.status(400).json({ 
              message: `Minimum quantity for the active plan (${plan.name}) is ${min}`, 
              minRequired: min 
            });
          }
        }
      } catch (e) {
        console.warn('Plan validation failed:', e.message);
        // continue silently; don't block request on plan lookup failure
      }
    }

    // Resolve companyId: try user first, then brand lookup
    let finalCompanyId = req.user.companyId;
    if (!finalCompanyId && brandId) {
      const brandDoc = await Brand.findById(brandId);
      if (brandDoc) finalCompanyId = brandDoc.companyId;
    }

    const order = new Order({
      orderId,
      productName,
      skuNumber: req.body.skuNumber || null,
      brand: brand || 'Unknown',
      batchNo: batchNo || `BATCH-${orderId}`,
      manufactureDate,
      expiryDate,
      quantity: quantityNumber,
      description,
      productInfo,
      createdBy: req.user._id,
      brandId,
      companyId: finalCompanyId,
      company: (req.user.role === 'company') ? req.user._id : (finalCompanyId ? null : null), // legacy
      status: 'Pending Authorization',
      // New dynamic fields (sanitize to avoid empty objects)
      mfdOn: (mfdOn && mfdOn.month && mfdOn.year) ? mfdOn : undefined,
      bestBefore: (bestBefore && bestBefore.value) ? bestBefore : undefined,
      calculatedExpiryDate: calculatedExpiryDate || null,
      dynamicFields: dynamicFields || {},
      variants: variants || [],
      productImage: productImage || null,
      // Coupon data (if provided)
      coupon: (req.body.coupon && req.body.coupon.title) ? {
        title: req.body.coupon.title,
        code: req.body.coupon.code || '',
        description: req.body.coupon.description || '',
        websiteLink: req.body.coupon.websiteLink || '',
        expiryDate: req.body.coupon.expiryDate || null,
      } : undefined,
      // Calculate and save pricing
      amount: (await calculateQrPrice(quantityNumber)).total,
      subtotal: (await calculateQrPrice(quantityNumber)).subtotal,
      tax: (await calculateQrPrice(quantityNumber)).tax,
      pricePerQr: (await calculateQrPrice(quantityNumber)).pricePerQr,
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
    console.error('Create order error details:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
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
    const userId = req.user._id;
    const userRole = req.user.role;
    const userBrandId = req.user.brandId?._id || req.user.brandId;
    const userBrandIds = (req.user.brandIds || []).map(id => id?._id || id);
    
    // Combine into a unique set of strings for the query
    const finalBrandIds = Array.from(new Set([
      ...(userBrandId ? [userBrandId.toString()] : []),
      ...userBrandIds.map(id => id.toString())
    ])).filter(id => id);

    if (['admin', 'superadmin'].includes(userRole)) {
      // Super Admin sees all
    } else if (userRole === 'creator') {
        // Creator sees their own orders OR orders for their brands OR for their company
        const creatorQuery = [
          { createdBy: userId },
          ...(finalBrandIds.length > 0 ? [{ brandId: { $in: finalBrandIds } }] : []),
          ...(req.user.companyId ? [{ companyId: req.user.companyId }] : [])
        ];
        query.$or = creatorQuery;
    } else if (['company', 'authorizer'].includes(userRole)) {
      // Company or Authorizer sees orders for their brands OR their company
      const companyId = req.user.companyId || (userRole === 'company' ? userId : null);
      
      const staffQuery = [
        ...(finalBrandIds.length > 0 ? [{ brandId: { $in: finalBrandIds } }] : []),
        ...(companyId ? [{ companyId }] : []),
        ...(userRole === 'company' ? [{ company: userId }] : []) // legacy fallback
      ];

      if (staffQuery.length > 0) {
          query.$or = staffQuery;
      } else {
          return res.status(403).json({ message: 'User not linked to a brand or company' });
      }
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let orders = await Order.find(query)
      .populate('createdBy', 'name email role')
      .populate({
        path: 'brandId',
        select: 'brandName companyId',
        populate: {
          path: 'companyId',
          select: 'companyName'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    // N+1 Fix: Fetch pricing configs ONCE for all orders
    const BillingConfig = require('../models/BillingConfig');
    const Setting = require('../models/Setting');
    
    const [config, settings] = await Promise.all([
      BillingConfig.getConfig(),
      Setting.getSettings()
    ]);
    
    let brackets = config.qrPricingBrackets || [];
    if (brackets.length === 0) {
        brackets = [
            { minQuantity: 500, maxQuantity: 5000, pricePerQr: 3 },
            { minQuantity: 5001, maxQuantity: 50000, pricePerQr: 2 },
            { minQuantity: 50001, maxQuantity: null, pricePerQr: 1 }
        ];
    }
    const gstPercentage = typeof settings.gstPercentage === 'number' ? settings.gstPercentage : 18;

    const calculatePriceInline = (quantity) => {
        let pricePerQr = 1;
        if (brackets.length > 0) {
            const match = brackets.find(b => {
                const min = b.minQuantity || 0;
                const max = b.maxQuantity || Infinity;
                return quantity >= min && (max === null || max === Infinity || quantity <= max);
            });
            if (match) {
                pricePerQr = match.pricePerQr;
            } else {
                const sortedByMin = [...brackets].sort((a, b) => a.minQuantity - b.minQuantity);
                if (quantity < sortedByMin[0].minQuantity) { pricePerQr = sortedByMin[0].pricePerQr; }
                else { pricePerQr = sortedByMin[sortedByMin.length - 1].pricePerQr; }
            }
        }
        const subtotal = Math.round(quantity * pricePerQr * 100) / 100;
        const tax = Math.round((subtotal * gstPercentage) / 100 * 100) / 100;
        const total = Math.round((subtotal + tax) * 100) / 100;
        return { pricePerQr, subtotal, tax, total };
    };

    // Auto-calculate amounts/breakdowns synchronously in memory
    orders = orders.map((o) => {
      if (!o.subtotal || o.subtotal === 0 || !o.tax || o.tax === 0) {
        const pricing = calculatePriceInline(o.quantity || 0);
        o.amount = pricing.total;
        o.pricePerQr = pricing.pricePerQr;
        o.subtotal = pricing.subtotal;
        o.tax = pricing.tax;
      }
      return o;
    });

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
      .populate({
        path: 'brandId',
        select: 'brandName companyId',
        populate: {
          path: 'companyId',
          select: 'companyName courierAddress registerOfficeAddress dispatchAddress'
        }
      })
      .populate({
        path: 'history.changedBy',
        select: 'name email role'
      })
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
    const userBrandIds = req.user.brandIds && req.user.brandIds.length > 0 
      ? req.user.brandIds.map(id => id.toString()) 
      : (req.user.brandId ? [req.user.brandId.toString()] : (req.user.role === 'company' ? [req.user._id.toString()] : []));
    
    const hasAccess = isAdmin || (order.brandId && userBrandIds.includes(order.brandId.toString()));

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

    // Verify ownership by brand or company id
    const userBrandIds = req.user.brandIds && req.user.brandIds.length > 0 
      ? req.user.brandIds.map(id => id.toString()) 
      : (req.user.brandId ? [req.user.brandId.toString()] : (req.user.role === 'company' ? [req.user._id.toString()] : []));

    const companyId = req.user.companyId || (req.user.role === 'company' ? req.user._id : null);
    
    const isBrandMatch = order.brandId && userBrandIds.includes(order.brandId.toString());
    const isCompanyMatch = order.companyId && companyId && order.companyId.toString() === companyId.toString();
    const isLegacyMatch = order.company && req.user.role === 'company' && order.company.toString() === req.user._id.toString();

    if (!isBrandMatch && !isCompanyMatch && !isLegacyMatch) {
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
      const pricing = await calculateQrPrice(shortfall);
      return res.status(400).json({
        insufficientCredits: true,
        required,
        available,
        shortfall,
        topupCostPerQr: pricing.pricePerQr,
        topupTotalCost: pricing.subtotal,
        companyId: company._id,
        companyName: company.companyName,
        message: `Insufficient QR credits. Need ${required}, have ${available}. ${shortfall} more needed.`
      });
    }

    // Deduct credits
    company.qrCredits -= required;
    await company.save({ validateModifiedOnly: true });
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
    const bonusQty = parseInt(req.body?.bonusQuantity) || 0;
    const totalQty = order.quantity + bonusQty;
    const brandName = order.brand;
    
    // Track bonus in order
    order.bonusQuantity = bonusQty;
    
    // Find last sequence number for this brand
    const lastProduct = await Product.findOne({ brand: brandName }).sort({ sequence: -1 });
    let startSeq = lastProduct && lastProduct.sequence ? lastProduct.sequence + 1 : 1;

    // Try to resolve Brand record for this order if available
    const brandDoc = await Brand.findOne({ brandName: brandName });

    for (let i = 0; i < totalQty; i++) {
      const currentSeq = startSeq + i;
      const seqString = currentSeq.toString().padStart(6, '0');
      const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const qrCode = `${brandName}-${seqString}-${order.orderId}-${uniqueSuffix}`;
      
      productsToCreate.push({
        qrCode,
        productName: order.productName,
        skuNumber: order.skuNumber,
        brand: brandName,
        brandId: brandDoc ? brandDoc._id : null,
        batchNo: order.batchNo,
        manufactureDate: order.manufactureDate,
        expiryDate: order.expiryDate,
        productImage: order.productImage,
        mfdOn: (order.mfdOn && order.mfdOn.month && order.mfdOn.year) ? order.mfdOn : undefined,
        bestBefore: (order.bestBefore && order.bestBefore.value) ? order.bestBefore : undefined,
        calculatedExpiryDate: order.calculatedExpiryDate,
        dynamicFields: order.dynamicFields,
        variants: order.variants,
        description: order.description,
        productInfo: order.productInfo,
        quantity: 1,
        sequence: currentSeq,
        orderId: order._id,
        isActive: false, // QRs are inactive until authorizer receives
        createdBy: req.user._id
      });
    }
    
    await Product.insertMany(productsToCreate);
    
    // Record bonus transaction if needed (admin grant)
    if (bonusQty > 0 && order.company) {
      const company = await Company.findById(order.company._id || order.company);
      if (company) {
        // Technically this doesn't deduct from balance, but it's a grant record
        // We track it as admin_grant
        await CreditTransaction.create({
          companyId: company._id,
          type: 'admin_grant',
          amount: bonusQty,
          balanceAfter: company.qrCredits, // Balance remains same as it was a free grant for this specific batch
          performedBy: req.user._id,
          orderId: order._id,
          note: `Bonus QR grant by ${req.user.role}: ${bonusQty} for Order ${order.orderId}`
        });
      }
    }

    // Update order
    order.qrCodesGenerated = true;
    order.qrGeneratedCount = totalQty;
    await order.save();

    // Create ProductCoupon entries if order has coupon data
    if (order.coupon && order.coupon.title) {
      try {
        const createdProducts = await Product.find({ orderId: order._id }).select('_id').lean();
        const couponDocs = createdProducts.map(p => ({
          title: order.coupon.title,
          code: order.coupon.code || '',
          description: order.coupon.description || '',
          websiteLink: order.coupon.websiteLink || '',
          expiryDate: order.coupon.expiryDate || null,
          productId: p._id,
          orderId: order._id,
          brandId: brandDoc ? brandDoc._id : null,
          companyId: brandDoc ? brandDoc.companyId : null,
        }));
        await ProductCoupon.insertMany(couponDocs);
        console.log(`Created ${couponDocs.length} ProductCoupon entries for order ${order.orderId}`);
      } catch (couponErr) {
        console.warn('Failed to create product coupons:', couponErr.message);
      }
    }

    // Send email notifications
    const recipients = await getNotificationRecipients(order);
    await sendOrderStatusEmail(recipients, {
      orderId: order.orderId,
      productName: order.productName,
      brand: order.brand,
      quantity: totalQty, // Use totalQty in email
      status: order.status,
      changedBy: req.user.name || req.user.email
    }, `${totalQty} QR codes generated successfully (including ${bonusQty} bonus).`);
    
    res.json({ 
      message: 'QR codes generated successfully', 
      order,
      qrCount: totalQty,
      bonusAdded: bonusQty
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
    const { trackingNumber, courierName, notes } = req.body || {};
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

    // Verify ownership by brand or company
    const userBrandIds = req.user.brandIds && req.user.brandIds.length > 0 
      ? req.user.brandIds.map(id => id.toString()) 
      : (req.user.brandId ? [req.user.brandId.toString()] : (req.user.role === 'company' ? [req.user._id.toString()] : []));

    const companyId = req.user.companyId || (req.user.role === 'company' ? req.user._id : null);
    
    const isBrandMatch = order.brandId && userBrandIds.includes(order.brandId.toString());
    const isCompanyMatch = order.companyId && companyId && order.companyId.toString() === companyId.toString();
    const isLegacyMatch = order.company && req.user.role === 'company' && order.company.toString() === req.user._id.toString();

    if (!isBrandMatch && !isCompanyMatch && !isLegacyMatch) {
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
    const { reason } = req.body || {};
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Permission check
  const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
  const userBrandIds = req.user.brandIds && req.user.brandIds.length > 0 
    ? req.user.brandIds.map(id => id.toString()) 
    : (req.user.brandId ? [req.user.brandId.toString()] : (req.user.role === 'company' ? [req.user._id.toString()] : []));

  const companyId = req.user.companyId || (req.user.role === 'company' ? req.user._id : null);
  
  const isBrandMatch = order.brandId && userBrandIds.includes(order.brandId.toString());
  const isCompanyMatch = order.companyId && companyId && order.companyId.toString() === companyId.toString();
  const isLegacyMatch = order.company && req.user.role === 'company' && order.company.toString() === req.user._id.toString();

  const isCompanyStaff = ['company', 'authorizer'].includes(req.user.role) && (isBrandMatch || isCompanyMatch || isLegacyMatch);

    if (!isAdmin && !isCompanyStaff) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Don't allow rejection of already received orders
    if (order.status === 'Received') {
      return res.status(400).json({ message: 'Cannot reject a completed order' });
    }

    // --- Refund credits if order was already authorized (credits were deducted) ---
    const creditsWereDeducted = ['Authorized', 'Order Processing', 'Dispatching', 'Dispatched'].includes(order.status);
    if (creditsWereDeducted && order.quantity > 0) {
      try {
        // Find company via brand
        const brand = order.brandId ? await Brand.findById(order.brandId) : null;
        const refundCompanyId = brand?.companyId || order.companyId;
        if (refundCompanyId) {
          const company = await Company.findById(refundCompanyId);
          if (company) {
            const refundAmount = order.quantity;
            company.qrCredits = (company.qrCredits || 0) + refundAmount;
            await company.save({ validateModifiedOnly: true });

            await CreditTransaction.create({
              companyId: company._id,
              type: 'refund',
              amount: refundAmount,
              balanceAfter: company.qrCredits,
              orderId: order._id,
              performedBy: req.user._id,
              note: `Refund: Order ${order.orderId} rejected — ${refundAmount} QR credits returned`
            });

            console.log(`💰 Refunded ${refundAmount} credits to ${company.companyName} for rejected order ${order.orderId}`);
          }
        }
      } catch (refundErr) {
        console.error('Credit refund error during rejection:', refundErr);
        // Don't block rejection if refund fails, but log it
      }
    }
    // --- End credit refund ---

    // When rejected, move to 'Rejected' status so it's clearly visible and can be edited/fixed
    order.status = 'Rejected';
    order.history.push({
      status: 'Rejected', // Logging 'Rejected' in history, but status moves back
      changedBy: req.user._id,
      role: req.user.role,
      comment: reason || 'Order rejected for corrections'
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

// 9b. EDIT ORDER (Can be done by Authorizer or Company when Pending)
router.put('/:id', protect, authorize('company', 'authorizer', 'creator'), async (req, res) => {
  try {
    const { 
      productName, 
      brand, 
      batchNo, 
      quantity, 
      description,
      productInfo,
      dynamicFields,
      variants,
      productImage
    } = req.body || {};
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Permission check
    const userBrandIds = req.user.brandIds && req.user.brandIds.length > 0 
      ? req.user.brandIds.map(id => id.toString()) 
      : (req.user.brandId ? [req.user.brandId.toString()] : (req.user.role === 'company' ? [req.user._id.toString()] : []));

    const companyId = req.user.companyId || (req.user.role === 'company' ? req.user._id : null);
    
    const isCreator = order.createdBy.toString() === req.user._id.toString();
    const isBrandMatch = order.brandId && userBrandIds.includes(order.brandId.toString());
    const isCompanyMatch = order.companyId && companyId && order.companyId.toString() === companyId.toString();
    const isLegacyMatch = order.company && req.user.role === 'company' && order.company.toString() === req.user._id.toString();

    if (!isCreator && !isBrandMatch && !isCompanyMatch && !isLegacyMatch) {
      return res.status(403).json({ message: 'Not authorized for this order' });
    }

    if (!['Pending Authorization', 'Rejected'].includes(order.status)) {
      return res.status(400).json({ message: 'Can only edit orders in Pending Authorization or Rejected state' });
    }

    // If it was rejected, move it back to Pending Authorization when edited
    const wasRejected = order.status === 'Rejected';
    if (wasRejected) {
      order.status = 'Pending Authorization';
    }

    // Update fields
    if (productName !== undefined) order.productName = productName;
    if (brand !== undefined) order.brand = brand;
    if (batchNo !== undefined) order.batchNo = batchNo;
    if (quantity !== undefined) order.quantity = quantity;
    if (description !== undefined) order.description = description;
    if (productInfo !== undefined) order.productInfo = productInfo;
    if (dynamicFields !== undefined) order.dynamicFields = dynamicFields;
    if (variants !== undefined) order.variants = variants;
    if (productImage !== undefined) order.productImage = productImage;

    order.history.push({
      status: 'Pending Authorization',
      changedBy: req.user._id,
      role: req.user.role,
      comment: wasRejected ? `Order fixed & re-submitted by ${req.user.role}` : `Order details modified by ${req.user.role}`
    });

    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Edit order error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 10. DOWNLOAD PDF
router.get('/:id/download', protect, async (req, res) => {
  console.log(`📄 PDF Download requested for Order ID: ${req.params.id}`);
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'brandId',
        populate: { path: 'companyId' }
      })
      .populate('company');
    
    if (!order) {
      console.log(`❌ Order not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log(`👤 User Role: ${req.user.role}`);
    // Authorization: Super Admins and Admins can download QR PDFs
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      console.log(`🚫 Forbidden: User role is ${req.user.role}, not authorized`);
      return res.status(403).json({ message: 'You are not authorized to download QR PDFs' });
    }

    
    if (!order.qrCodesGenerated) {
      console.log(`⚠️ QR codes not generated for order: ${order.orderId}`);
      return res.status(400).json({ message: 'QR codes not generated yet' });
    }
    
    // Find products for this order
    const products = await Product.find({ orderId: order._id }).sort({ sequence: 1 });
    console.log(`📦 Found ${products.length} products for PDF generation`);
    
    if (products.length === 0) {
      console.log(`❌ No products found in DB for order: ${order._id}`);
      return res.status(404).json({ message: 'No QR codes found for this order' });
    }

    // Fetch the documents to build the options
    const brandDoc = order.brandId;
    const companyDoc = brandDoc?.companyId;

    const pdfOptions = {
      orderId: order.orderId || order._id.toString(),
      brand: order.brand || brandDoc?.brandName || 'N/A',
      brandId: order.brandId?._id || order.brandId || '',
      brandLogo: brandDoc?.brandLogo || '',
      company: companyDoc?.companyName || 'N/A',
      companyName: companyDoc?.companyName || 'N/A'
    };
    
    console.log(`📐 PDF Options: ${JSON.stringify(pdfOptions, null, 2)}`);
    
    // Stream the PDF directly to the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=order_${pdfOptions.orderId}.pdf`);
    
    console.log('🏁 Starting PDF Stream...');
    await generateQrPdfStream(products, res, pdfOptions);
    console.log(`✅ PDF Streamed successfully for order: ${pdfOptions.orderId}`);



  } catch (error) {
    console.error('❌ Download PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

});

// 10b. DOWNLOAD QR IMAGES (ZIP of individual QR images)
router.get('/:id/download-images', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!order.qrCodesGenerated) {
      return res.status(400).json({ message: 'QR codes not generated yet' });
    }

    const products = await Product.find({ orderId: order._id }).sort({ sequence: 1 }).lean();
    if (products.length === 0) {
      return res.status(404).json({ message: 'No QR codes found' });
    }

    const format = (req.query.format || 'png').toLowerCase();
    const archiver = require('archiver');
    const { generateQrImagePages } = require('../utils/canvasGenerator');

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=order_${order.orderId}_qr_pages_${format}.zip`);

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    const brandColor = order.brandId?.config?.brandColor || order.brandColor || "#000000";
    
    // Generate the pages (array of { buffer, filename })
    const pages = await generateQrImagePages(products, format, {
        orderId: order.orderId,
        brand: order.brand,
        brandColor: brandColor,
        scoring: true
    });

    for (const page of pages) {
        archive.append(page.buffer, { name: page.filename });
    }

    await archive.finalize();
  } catch (error) {
    console.error('Download Images error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
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
