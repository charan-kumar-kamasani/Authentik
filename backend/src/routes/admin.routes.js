const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const User = require("../models/User");
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const Company = require("../models/Company");
const { protect, authorize } = require("../middleware/authMiddleware");
const { generateQrPdf } = require("../utils/pdfGenerator");

const router = express.Router();

// ── In-memory Email OTP store (prod: use Redis) ──
const emailOtpStore = new Map(); // key: email, value: { otp, expiresAt }

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const getEmailTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
});

// Send OTP to an email address (protected – admin/superadmin only)
router.post('/email-otp/send', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'email is required' });

    const otp = generateOtp();
    emailOtpStore.set(email.toLowerCase(), { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min

    // Try to send real email; fall back gracefully
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        const transporter = getEmailTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Authentik – Email Verification OTP',
          html: '<div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px"><h2 style="color:#0f172a">Verify your email</h2><p>Your OTP is:</p><div style="font-size:32px;font-weight:800;letter-spacing:6px;text-align:center;padding:16px;background:#f1f5f9;border-radius:8px">' + otp + '</div><p style="color:#64748b;font-size:13px;margin-top:16px">This code expires in 10 minutes.</p></div>',
        });
      } else {
        console.log('[DEV] Email OTP for', email, ':', otp);
      }
    } catch (mailErr) {
      console.warn('Failed to send email OTP, but stored:', mailErr.message);
      console.log('[FALLBACK] Email OTP for', email, ':', otp);
    }

    res.json({ success: true, message: 'OTP sent to ' + email });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify email OTP
router.post('/email-otp/verify', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'email and otp are required' });

    const entry = emailOtpStore.get(email.toLowerCase());
    if (!entry) return res.status(400).json({ success: false, message: 'No OTP found for this email. Please request a new one.' });
    if (Date.now() > entry.expiresAt) {
      emailOtpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    if (entry.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    emailOtpStore.delete(email.toLowerCase());
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            token: jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'SECRET', { expiresIn: "30d" }),
        });
  } else {
    res.status(401).json({ error: "Invalid email or password" });
  }
});

// Get Companies
router.get('/companies', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        // Admins see companies they created; superadmin sees all
        if (req.user.role === 'admin') {
            const companies = await Company.find({ createdBy: req.user._id });
            return res.json(companies);
        }
        const companies = await Company.find({});
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create User (Admin creates Manager, Super Admin creates Admin)
router.post(
  "/create-user",
  protect,
  authorize("superadmin", "admin"),
  async (req, res) => {
    const { email, password, role, name } = req.body; // mobile can be optional or name

    // Super Admin can create Admin
    // Admin can create Manager
    if (req.user.role === "admin" && role !== "manager") {
      return res.status(403).json({ error: "Admins can only create Managers" });
    }

    if (req.user.role === "superadmin" && role !== "admin" && role !== "manager") {
        return res.status(403).json({ error: "Super Admin can create Admins and Managers" });
    }
    
    // Prevent creating SuperAdmin via API for safety
    if (role === 'superadmin') {
         return res.status(403).json({ error: "Cannot create Super Admin" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      createdBy: req.user._id,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  }
);

// Get Users (Hierarchy based)
router.get("/users", protect, authorize("superadmin", "admin"), async (req, res) => {
    let query = {};
    if (req.user.role === 'admin') {
        query = { createdBy: req.user._id, role: 'manager' }; 
    } else if (req.user.role === 'superadmin') {
         query = { role: { $in: ['admin', 'manager'] } };
    }

    const users = await User.find(query).populate('createdBy', 'email');
    res.json(users);
});

router.post(
  "/create-qr",
  protect,
        // Only admin and manager should create QRs directly. Creators must create Orders instead.
        authorize("admin", "manager"),
  async (req, res) => {
    let { productName, brand, batchNo, manufactureDate, expiryDate, quantity } = req.body;
    
    // Ensure quantity is a number, default to 1 if invalid
    const qty = parseInt(quantity) > 0 ? parseInt(quantity) : 1;

    const createdProducts = [];

    // Loop to create 'qty' number of records
    for (let i = 0; i < qty; i++) {
    // Findings the max sequence for this brand
    const lastProduct = await Product.findOne({ brand }).sort({ sequence: -1 });
        const nextSeq = lastProduct && lastProduct.sequence ? lastProduct.sequence + 1 : 1;
        const seqString = nextSeq.toString().padStart(4, '0'); // 0001, 0002...
        
        // Generate Unique String (random 4 chars) to ensure absolute uniqueness if needed, or just rely on IDs.
        const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        
        const qrCode = `${brand}-${seqString}-${batchNo}-${uniqueSuffix}`;

                // Try to resolve brandId if a Brand record exists
                const brandDoc = await Brand.findOne({ brandName: brand });
                const product = await Product.create({
          qrCode,
          productName,
          brand,
                    brandId: brandDoc ? brandDoc._id : null,
          batchNo,
          manufactureDate,
          expiryDate,
          quantity: 1, // Each individual unit is 1
          sequence: nextSeq,
          createdBy: req.user._id,
        });
        
        createdProducts.push(product);
    }

    try {
        // Generate PDF containing ALL generated QRs
        const pdfOptions = {
            brand: productName || createdProducts[0]?.productName || 'N/A',
            brandId: brandDoc?._id?.toString() || '',
            brandLogo: brandDoc?.brandLogo || '',
            company: brandDoc?.companyName || 'N/A',
            companyName: brandDoc?.companyName || 'N/A',
            orderId: batchNo || 'Bulk-Generated'
        };
        const pdfBase64 = await generateQrPdf(createdProducts, req.user.email, pdfOptions);
        res.status(201).json({ products: createdProducts, count: createdProducts.length, pdfBase64 });
    } catch (e) {
        console.error("PDF Gen Error", e);
        res.status(201).json({ products: createdProducts, count: createdProducts.length, pdfBase64: null }); 
    }
  }

);

router.post(
  "/bulk-upload-qrs",
  protect,
        // Only admin and manager allowed to bulk upload QRs. Creators should use the order workflow.
        authorize("admin", "manager"),
  async (req, res) => {
    const products = req.body; // Array of product objects
    
    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: "Invalid data format" });
    }

    const results = [];

    // Process sequentially to maintain order and correct sequence numbers
    for (const item of products) {
        const { productName, brand, batchNo, manufactureDate, expiryDate, quantity } = item;
        
        // Find latest sequence for THIS item's brand
        // Note: For high concurrency real-time, this needs atomic set or transactions. 
        // For current scope (one admin uploading), finding max here is acceptable but imperfect if multiple items of same brand in array.
        // Better: We must check 'results' created so far in this loop too? 
        // Or simply query DB every time (slow but safe).
        
    const lastProduct = await Product.findOne({ brand }).sort({ sequence: -1 });
    let nextSeq = lastProduct && lastProduct.sequence ? lastProduct.sequence + 1 : 1;
        
        // Check if we just added this brand in this very transaction loop
        // (If input has 10 Nike items, DB won't see 1-9 yet if we don't save immediately or track local offset)
        // We will save immediately in the loop to be simple and safe.
        
        const seqString = nextSeq.toString().padStart(4, '0');
        const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const qrCode = `${brand}-${seqString}-${batchNo}-${uniqueSuffix}`;

        const brandDoc = await Brand.findOne({ brandName: brand });
        const newProduct = await Product.create({
            qrCode,
            productName,
            brand,
            brandId: brandDoc ? brandDoc._id : null,
            batchNo,
            manufactureDate,
            expiryDate,
            quantity,
            sequence: nextSeq,
            createdBy: req.user._id
        });
        
        results.push(newProduct);
    }

    try {
        const pdfOptions = {
            brand: productName || results[0]?.productName || 'N/A',
            brandId: brandDoc?._id?.toString() || '',
            brandLogo: brandDoc?.brandLogo || '',
            company: brandDoc?.companyName || 'N/A',
            companyName: brandDoc?.companyName || 'N/A',
            orderId: batchNo || 'Bulk-Upload'
        };
        const pdfBase64 = await generateQrPdf(results, req.user.email, pdfOptions);
        res.status(201).json({ 
            message: `Successfully created ${results.length} QRs`, 
            count: results.length,
            pdfBase64
        });
    } catch(e) {
        console.error("PDF Gen Error", e);
         res.status(201).json({ 
            message: `Successfully created ${results.length} QRs (PDF Failed)`, 
            count: results.length 
        });
    }
  }
);

// Get QRs
router.get('/qrs', protect, authorize('admin', 'manager', 'superadmin', 'creator', 'authorizer', 'company'), async (req, res) => {
    try {
        // Default: no filter for superadmin
        let query = {};

        // Admins and managers see products they created
        if (req.user.role === 'admin' || req.user.role === 'manager') {
            query = { createdBy: req.user._id };
        }

        // Creators, authorizers and company users should see inventory scoped to their brand
        if (['creator', 'authorizer', 'company'].includes(req.user.role)) {
            const brandId = req.user.brandId || req.user._id;
            if (brandId) {
                query = { brandId };
            } else {
                // If no brand linkage, fall back to createdBy to avoid exposing everything
                query = { createdBy: req.user._id };
            }
        }

        // superadmin: query remains empty (see all)

        const products = await Product.find(query).populate('createdBy', 'email role');
        res.json(products);
    } catch (error) {
        console.error('Get QRs error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// 1. Create Company User (Admin only)
router.post('/users/company', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const { name, email, password, companyId } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            email,
            password: hashedPassword,
            role: 'company',
            companyId: companyId || null,
            createdBy: req.user._id
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Create Authorizer/Creator (Company only, now also Admin/Superadmin can create staff)
router.post('/users/staff', protect, async (req, res) => {
    try {
        if (!['company', 'authorizer', 'admin', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized for this action' });
        }

    const { name, email, password, role, brandId: bodyBrandId, brandIds: bodyBrandIds, companyId: bodyCompanyId } = req.body; 
        
        if (!['authorizer', 'creator'].includes(role)) {
             return res.status(400).json({ message: 'Invalid role' });
        }

        // If creator is creating an authorizer, only companies (or admins) can do it. We allow admin/superadmin to create authorizers too.
        // Determine brandId and companyId based on who is creating and request body
    let brandId = null;
    let brandIds = [];
    let companyId = null;

        if (req.user.role === 'company') {
            // company user may have brandId/companyId set; otherwise fall back to their own id
            brandId = req.user.brandId || null;
            companyId = req.user.companyId || req.user._id;
        } else {
            // Admins or others may pass brandId/companyId in body
            if (Array.isArray(bodyBrandIds) && bodyBrandIds.length > 0) {
                brandIds = bodyBrandIds;
            } else if (bodyBrandId) {
                brandIds = [bodyBrandId];
            }
            if (bodyCompanyId) companyId = bodyCompanyId;
            // If no companyId but we have any brand id, try to resolve it from the first Brand
            if (brandIds.length > 0 && !companyId) {
                const brandDoc = await Brand.findById(brandIds[0]);
                if (brandDoc) companyId = brandDoc.companyId || null;
            }
            // If still no companyId, but requester has companyId, inherit it
            if (!companyId && req.user.companyId) companyId = req.user.companyId;
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // For backwards compatibility, keep brandId as first assigned brand (or null)
        brandId = brandIds.length > 0 ? brandIds[0] : (bodyBrandId || null);

        const user = await User.create({
            email,
            password: hashedPassword,
            role,
            brandId,
            brandIds,
            companyId,
            createdBy: req.user._id
        });
        res.status(201).json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Staff for Company
router.get('/users/staff', protect, async (req, res) => {
    try {
      console.log("Get Staff Users - Requester:", req.user.email, "Role:", req.user.role);
            const { brandId } = req.query;

            // Superadmin: can view all staff across brands or filter by brandId
            if (req.user.role === 'superadmin') {
                if (brandId) {
                    // Match users who have brandId set OR have brandIds array containing the brand
                    const staff = await User.find({
                        $and: [
                            { role: { $in: ['authorizer', 'creator'] } },
                            { $or: [ { brandId }, { brandIds: brandId } ] }
                        ]
                    });
                    return res.json(staff);
                }
                const staff = await User.find({ role: { $in: ['authorizer', 'creator'] } });
                return res.json(staff);
            }

            // Admin: return companies created by this admin (existing behaviour)
            if (req.user.role === 'admin') {
                const companies = await User.find({ role: 'company', createdBy: req.user._id });
                return res.json(companies);
            }

            // Company: return staff belonging to this brand/company (prefer brandId)
            if (req.user.role === 'company') {
                const bid = req.user.brandId || req.user._id;
                const staff = await User.find({ brandId: bid });
                return res.json(staff);
            }

            return res.status(403).json({ message: 'Not authorized' });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

// Brand Routes
// Create Brand
router.post('/brands', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        // Brand payload now only contains brandName, brandLogo and companyId
        const { brandName, brandLogo, companyId } = req.body;

        if (!brandName || !companyId) {
            return res.status(400).json({ message: 'brandName and companyId are required' });
        }

        const brand = await Brand.create({
            brandName,
            brandLogo,
            companyId,
            createdBy: req.user._id
        });

        res.status(201).json(brand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Brands (optionally filter by companyId)
router.get('/brands', protect, authorize('admin', 'superadmin', 'company', 'authorizer', 'creator'), async (req, res) => {
    try {
        const { companyId } = req.query;
        const query = {};
        if (companyId) query.companyId = companyId;
        const brands = await Brand.find(query).populate('companyId', 'companyName');
        res.json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Company (with optional brands array)
router.post('/companies', protect, authorize('superadmin', 'admin'), async (req, res) => {
    try {
        const {
            companyName,
            officialEmails,
            legalEntity,
            companyWebsite,
            industry,
            category,
            country,
            city,
            cinGst,
            registerOfficeAddress,
            courierAddress,
            dispatchAddress,
            email, // support mail
            supportNumber,
            phoneNumber, // contact number
            contactPersonName,
            authorizerEmails, // array of { email, password } or plain strings
            creatorEmails, // array of { email, password } or plain strings
            brands // optional array: [{ brandName, brandLogo }, ...]
        } = req.body;

        if (!companyName) {
            return res.status(400).json({ message: 'companyName is required' });
        }

        // Normalise authorizer emails: support both { email, password } objects and plain strings
        const authorizerList = (authorizerEmails || []).map(e => typeof e === 'string' ? { email: e, password: '' } : e);
        const authorizerEmailStrings = authorizerList.map(e => e.email);

        // Normalise creator emails the same way
        const creatorList = (creatorEmails || []).map(e => typeof e === 'string' ? { email: e, password: '' } : e);
        const creatorEmailStrings = creatorList.map(e => e.email);

        const company = await Company.create({
            companyName,
            officialEmails: officialEmails || [],
            legalEntity,
            companyWebsite,
            industry,
            category,
            country,
            city,
            cinGst,
            registerOfficeAddress,
            courierAddress,
            dispatchAddress,
            email,
            supportNumber,
            phoneNumber,
            contactPersonName,
            authorizerEmails: authorizerEmailStrings,
            creatorEmails: creatorEmailStrings,
            createdBy: req.user._id
        });

        const createdBrands = [];
        if (Array.isArray(brands) && brands.length > 0) {
            for (const b of brands) {
                if (!b.brandName) continue;
                const created = await Brand.create({
                    brandName: b.brandName,
                    brandLogo: b.brandLogo || null,
                    companyId: company._id,
                    createdBy: req.user._id
                });
                createdBrands.push(created);
            }
        }

        // Determine brandId/brandIds for new users (all brands of this company)
        const allBrandIds = createdBrands.map(b => b._id);
        const firstBrandId = allBrandIds.length > 0 ? allBrandIds[0] : null;

        // Create user accounts for authorizers
        const createdUsers = [];
        for (const auth of authorizerList) {
            if (!auth.email || !auth.password) continue;
            const exists = await User.findOne({ email: auth.email });
            if (exists) continue; // skip if user already exists
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(auth.password, salt);
            const user = await User.create({
                email: auth.email,
                password: hashed,
                role: 'authorizer',
                brandId: firstBrandId,
                brandIds: allBrandIds,
                companyId: company._id,
                createdBy: req.user._id
            });
            createdUsers.push(user);
        }

        // Create user accounts for creators
        for (const cr of creatorList) {
            if (!cr.email || !cr.password) continue;
            const exists = await User.findOne({ email: cr.email });
            if (exists) continue;
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(cr.password, salt);
            const user = await User.create({
                email: cr.email,
                password: hashed,
                role: 'creator',
                brandId: firstBrandId,
                brandIds: allBrandIds,
                companyId: company._id,
                createdBy: req.user._id
            });
            createdUsers.push(user);
        }

        res.status(201).json({ company, brands: createdBrands, users: createdUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current authenticated admin/staff user details (including brand & company)
router.get('/me', protect, async (req, res) => {
    try {
        // Populate brandId and companyId to return names if present
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('brandId', 'brandName')
            .populate('companyId', 'companyName qrCredits');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ══════════════════════════════════════════════════════════
// ═══  QR CREDITS  ═══
// ══════════════════════════════════════════════════════════
const CreditTransaction = require('../models/CreditTransaction');

const QR_TOPUP_PRICE = 5; // ₹5 per QR for top-up purchases

// Get credit balance for the logged-in user's company
router.get('/credits/balance', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.companyId) return res.status(400).json({ message: 'User not linked to a company' });
        const company = await Company.findById(user.companyId);
        if (!company) return res.status(404).json({ message: 'Company not found' });
        res.json({ companyId: company._id, companyName: company.companyName, qrCredits: company.qrCredits || 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get credit balance for a specific company (superadmin)
router.get('/credits/balance/:companyId', protect, authorize('superadmin', 'admin'), async (req, res) => {
    try {
        const company = await Company.findById(req.params.companyId);
        if (!company) return res.status(404).json({ message: 'Company not found' });
        res.json({ companyId: company._id, companyName: company.companyName, qrCredits: company.qrCredits || 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check if company has enough credits for an order
router.get('/credits/check/:orderId', protect, async (req, res) => {
    try {
        const Order = require('../models/Order');
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Find company via brand
        const brand = await Brand.findById(order.brandId);
        if (!brand) return res.status(400).json({ message: 'Brand not found for this order' });
        const company = await Company.findById(brand.companyId);
        if (!company) return res.status(400).json({ message: 'Company not found for this brand' });

        const required = order.quantity;
        const available = company.qrCredits || 0;
        const sufficient = available >= required;
        const shortfall = sufficient ? 0 : required - available;

        res.json({
            sufficient,
            required,
            available,
            shortfall,
            topupCostPerQr: QR_TOPUP_PRICE,
            topupTotalCost: shortfall * QR_TOPUP_PRICE,
            companyId: company._id,
            companyName: company.companyName,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Buy credits via plan
router.post('/credits/buy-plan', protect, authorize('company', 'authorizer'), async (req, res) => {
    try {
        const { planId } = req.body;
        const PricePlan = require('../models/PricePlan');
        const plan = await PricePlan.findById(planId);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const user = await User.findById(req.user._id);
        if (!user || !user.companyId) return res.status(400).json({ message: 'User not linked to a company' });
        const company = await Company.findById(user.companyId);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        // Parse qrCodes from plan (e.g. "5,000" -> 5000 or "Unlimited" -> 999999)
        let creditsToAdd = 0;
        if (plan.qrCodes) {
            const parsed = parseInt(String(plan.qrCodes).replace(/[^\d]/g, ''), 10);
            creditsToAdd = isNaN(parsed) ? 0 : parsed;
        }
        if (creditsToAdd <= 0) return res.status(400).json({ message: 'This plan does not include QR credits' });

        const newBalance = (company.qrCredits || 0) + creditsToAdd;
        company.qrCredits = newBalance;
        await company.save({ validateModifiedOnly: true });

        await CreditTransaction.create({
            companyId: company._id,
            type: 'purchase_plan',
            amount: creditsToAdd,
            balanceAfter: newBalance,
            unitPrice: plan.pricePerQr || 0,
            totalPaid: plan.price || 0,
            planName: plan.name,
            performedBy: req.user._id,
            note: 'Purchased plan: ' + plan.name,
        });

        res.json({ message: 'Plan purchased successfully', qrCredits: newBalance, creditsAdded: creditsToAdd });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Buy top-up credits (pay per QR at ₹5 each)
router.post('/credits/buy-topup', protect, authorize('company', 'authorizer'), async (req, res) => {
    try {
        const { quantity } = req.body; // number of QR credits to buy
        if (!quantity || quantity <= 0) return res.status(400).json({ message: 'Invalid quantity' });

        const user = await User.findById(req.user._id);
        if (!user || !user.companyId) return res.status(400).json({ message: 'User not linked to a company' });
        const company = await Company.findById(user.companyId);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        const totalCost = quantity * QR_TOPUP_PRICE;
        const newBalance = (company.qrCredits || 0) + quantity;
        company.qrCredits = newBalance;
        await company.save({ validateModifiedOnly: true });

        await CreditTransaction.create({
            companyId: company._id,
            type: 'purchase_topup',
            amount: quantity,
            balanceAfter: newBalance,
            unitPrice: QR_TOPUP_PRICE,
            totalPaid: totalCost,
            performedBy: req.user._id,
            note: 'Top-up: ' + quantity + ' QR credits at ₹' + QR_TOPUP_PRICE + '/QR',
        });

        res.json({ message: 'Credits purchased successfully', qrCredits: newBalance, creditsAdded: quantity, totalPaid: totalCost });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Grant credits manually (superadmin only)
router.post('/credits/grant', protect, authorize('superadmin'), async (req, res) => {
    try {
        const { companyId, quantity, note } = req.body;
        if (!companyId || !quantity) return res.status(400).json({ message: 'companyId and quantity are required' });

        const company = await Company.findById(companyId);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        const newBalance = (company.qrCredits || 0) + quantity;
        company.qrCredits = newBalance;
        await company.save({ validateModifiedOnly: true });

        await CreditTransaction.create({
            companyId: company._id,
            type: 'admin_grant',
            amount: quantity,
            balanceAfter: newBalance,
            performedBy: req.user._id,
            note: note || 'Admin granted ' + quantity + ' credits',
        });

        res.json({ message: 'Credits granted', qrCredits: newBalance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Transaction history
router.get('/credits/transactions', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        let query = {};

        if (['superadmin', 'admin'].includes(user.role)) {
            // Admin sees all, or filter by companyId query param
            if (req.query.companyId) query.companyId = req.query.companyId;
        } else {
            if (!user.companyId) return res.status(400).json({ message: 'User not linked to a company' });
            query.companyId = user.companyId;
        }

        const transactions = await CreditTransaction.find(query)
            .populate('performedBy', 'name email role')
            .populate('orderId', 'orderId productName quantity')
            .sort({ createdAt: -1 })
            .limit(parseInt(req.query.limit) || 100);

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;


