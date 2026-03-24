const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const User = require("../models/User");
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const Company = require("../models/Company");
const FormConfig = require("../models/FormConfig");
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
          subject: '🔐 Authentiks – Email Verification OTP',
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.07);overflow:hidden;">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#6366f1 100%);padding:40px 32px;text-align:center;">
              <div style="background-color:rgba(255,255,255,0.2);width:80px;height:80px;margin:0 auto 20px;border-radius:50%;display:flex;align-items:center;justify-content:center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0;letter-spacing:-0.5px;">Verify Your Email</h1>
              <p style="color:rgba(255,255,255,0.9);font-size:15px;margin:12px 0 0;font-weight:500;">Welcome to Authentiks</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:40px 32px;">
              <p style="color:#334155;font-size:16px;line-height:1.6;margin:0 0 24px;">
                Hi there! 👋
              </p>
              <p style="color:#334155;font-size:16px;line-height:1.6;margin:0 0 32px;">
                We received a request to verify your email address. Use the verification code below to complete your registration:
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td align="center" style="background:linear-gradient(135deg,#f1f5f9 0%,#e2e8f0 100%);border-radius:12px;padding:24px;border:2px dashed #cbd5e1;">
                    <p style="color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Your Verification Code</p>
                    <div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#1e293b;font-family:'Courier New',monospace;">${otp}</div>
                  </td>
                </tr>
              </table>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;padding:16px;margin:0 0 32px;">
                <tr>
                  <td>
                    <p style="color:#92400e;font-size:14px;line-height:1.5;margin:0;">
                      ⏰ <strong>This code expires in 10 minutes.</strong> If you didn't request this verification, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0;">
                If you have any questions or need assistance, feel free to reach out to our support team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 8px;">
                &copy; ${new Date().getFullYear()} Authentiks. All rights reserved.
              </p>
              <p style="color:#cbd5e1;font-size:12px;margin:0;">
                This is an automated message, please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `,
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
        // Check if user is blocked
        if (user.status === 'blocked') {
          return res.status(403).json({ error: "Your account is blocked. Please contact support." });
        }

        // Check if brand is blocked (if user is linked to one)
        if (['authorizer', 'creator', 'company'].includes(user.role) && user.brandId) {
          const brand = await Brand.findById(user.brandId);
          if (brand && brand.status === 'blocked') {
             return res.status(403).json({ error: "The associated brand is blocked. Please contact support." });
          }
        }

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

// Get Single Company
router.get('/companies/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: 'Company not found' });
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all brands associated with a specific company
router.get('/company-brands/:companyId', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const brands = await Brand.find({ companyId: req.params.companyId });
    res.json(brands);
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
         // Superadmin can see all users (system users + mobile users)
         query = { role: { $in: ['admin', 'manager', 'user', 'company', 'authorizer', 'creator'] } };
    }

    const users = await User.find(query).populate('createdBy', 'email');
    res.json(users);
});

router.post(
  "/create-qr",
  protect,
        // Only superadmin should create QRs directly. Creators must create Orders instead.
        authorize("superadmin"),
  async (req, res) => {
    let { 
      productName, 
      brand, 
      batchNo, 
      manufactureDate, 
      expiryDate, 
      quantity,
      description,
      productInfo,
      productImage,
      // New dynamic fields
      mfdOn,
      bestBefore,
      calculatedExpiryDate,
      dynamicFields,
      variants // Array of {variantName, value}
    } = req.body;
    
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
          description: description || null,
          productInfo: productInfo || null,
          manufactureDate: manufactureDate || null,
          expiryDate: expiryDate || calculatedExpiryDate || null,
          quantity: 1, // Each individual unit is 1
          sequence: nextSeq,
          createdBy: req.user._id,
          // New dynamic fields (sanitize to avoid empty objects)
          mfdOn: (mfdOn && mfdOn.month && mfdOn.year) ? mfdOn : undefined,
          bestBefore: (bestBefore && bestBefore.value) ? bestBefore : undefined,
          calculatedExpiryDate: calculatedExpiryDate || null,
          dynamicFields: dynamicFields || {},
          variants: variants || [],
          productImage: productImage || null,
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
        // Only superadmin allowed to bulk upload QRs. Creators should use the order workflow.
        authorize("superadmin"),
  async (req, res) => {
    const products = req.body; // Array of product objects
    
    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: "Invalid data format" });
    }

    const results = [];

    // Process sequentially to maintain order and correct sequence numbers
    for (const item of products) {
        const { productName, brand, batchNo, manufactureDate, expiryDate, quantity, description, productInfo } = item;
        
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
            description,
            productInfo,
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
            const brandIds = req.user.brandIds && req.user.brandIds.length > 0 
                ? req.user.brandIds 
                : (req.user.brandId ? [req.user.brandId] : (req.user.role === 'company' ? [req.user._id] : []));
            
            if (brandIds.length > 0) {
                query = { brandId: { $in: brandIds } };
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
            const { brandId, role } = req.query;
            console.log("Filters - Brand:", brandId, "Role:", role);

            // Superadmin: can view all staff/users across categories
            if (req.user.role === 'superadmin') {
                let query = {};
                
                // Construct query based on provided filters
                const roles = role ? [role] : ['admin', 'manager', 'user', 'company', 'authorizer', 'creator'];
                query.role = { $in: roles };

                if (brandId) {
                    query.$or = [{ brandId }, { brandIds: brandId }];
                }

                const users = await User.find(query).populate('createdBy', 'email');
                return res.json(users);
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

// Update Staff User
router.patch('/users/staff/:id', protect, async (req, res) => {
    try {
        if (!['company', 'admin', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized for this action' });
        }

        const { id } = req.params;
        const { name, email, password, role, brandId, brandIds, companyId } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update fields if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) {
            if (!['authorizer', 'creator'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            user.role = role;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        if (Array.isArray(brandIds)) {
            user.brandIds = brandIds;
            if (brandIds.length > 0) user.brandId = brandIds[0];
        } else if (brandId) {
            user.brandId = brandId;
            user.brandIds = [brandId];
        }

        if (companyId) user.companyId = companyId;

        await user.save();
        res.json({ success: true, user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Brand Routes
// Create Brand
router.post('/brands', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const { 
            brandName, 
            brandLogo, 
            companyId,
            legalEntity,
            brandWebsite,
            industry,
            country,
            city,
            cinGst,
            registerOfficeAddress,
            dispatchAddress,
            email,
            phoneNumber,
            contactPersonName
        } = req.body;

        if (!brandName || !companyId) {
            return res.status(400).json({ message: 'brandName and companyId are required' });
        }

        const brand = await Brand.create({
            brandName,
            brandLogo,
            companyId,
            legalEntity,
            brandWebsite,
            industry,
            country,
            city,
            cinGst,
            registerOfficeAddress,
            dispatchAddress,
            email,
            phoneNumber,
            contactPersonName,
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
        const brands = await Brand.find(query).populate('companyId', 'companyName qrCredits legalEntity status');
        res.json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Brand (status, name, logo)
router.patch('/brands/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
    try {
        const updates = req.body;
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        // Apply updates
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) brand[key] = updates[key];
        });

        await brand.save();
        res.json(brand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Company (credits, status, details)
router.patch('/companies/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
    try {
        const {
            authorizerEmails,
            creatorEmails,
            brands,
            ...updates
        } = req.body;
        
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        // Apply basic updates
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) company[key] = updates[key];
        });
        
        // Handle Authorizer/Creator email strings in Company model
        if (Array.isArray(authorizerEmails)) {
            company.authorizerEmails = authorizerEmails.map(e => {
                if (typeof e === 'string') return e;
                return e?.email || e?.value || "";
            }).filter(email => email);
        }
        if (Array.isArray(creatorEmails)) {
            company.creatorEmails = creatorEmails.map(e => {
                if (typeof e === 'string') return e;
                return e?.email || e?.value || "";
            }).filter(email => email);
        }

        await company.save();

        // Handle User creation for any new authorizer/creator emails
        const allBrands = await Brand.find({ companyId: company._id });
        const allBrandIds = allBrands.map(b => b._id);
        const firstBrandId = allBrandIds.length > 0 ? allBrandIds[0] : null;

        const processEmails = async (emailList, role) => {
            const created = [];
            if (!Array.isArray(emailList)) return created;
            
            for (const entry of emailList) {
                const email = typeof entry === 'string' ? entry : (entry?.email || entry?.value || "");
                const password = typeof entry === 'object' ? (entry?.password || "") : "";
                
                if (!email) continue;
                const exists = await User.findOne({ email });
                if (exists) {
                    // Update user fields if they are missing
                    let userChanged = false;
                    if (!exists.companyId) {
                        exists.companyId = company._id;
                        userChanged = true;
                    }
                    // For staff, ensure they are linked to all company brands
                    exists.brandIds = allBrandIds;
                    exists.brandId = firstBrandId;
                    userChanged = true;

                    // Update password if a new one is provided
                    if (password) {
                        const salt = await bcrypt.genSalt(10);
                        exists.password = await bcrypt.hash(password, salt);
                        userChanged = true;
                    }

                    if (userChanged) await exists.save();
                    continue;
                }
                
                if (!password) continue; // Need password to create NEW user

                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(password, salt);
                const user = await User.create({
                    email,
                    password: hashed,
                    role,
                    brandId: firstBrandId,
                    brandIds: allBrandIds,
                    companyId: company._id,
                    createdBy: req.user._id
                });
                created.push(user);
            }
            return created;
        };

        let newUsers = [];
        if (authorizerEmails) newUsers = newUsers.concat(await processEmails(authorizerEmails, 'authorizer'));
        if (creatorEmails) newUsers = newUsers.concat(await processEmails(creatorEmails, 'creator'));

        // Handle Brands
        const newBrands = [];
        if (Array.isArray(brands) && brands.length > 0) {
            for (const b of brands) {
                if (!b.brandName) continue;
                
                let brandToUpdate = null;
                // 1. Try finding by ID if provided
                if (b._id) {
                    brandToUpdate = await Brand.findById(b._id);
                }
                
                // 2. Fallback to name-based lookup for this company if no ID or not found by ID
                if (!brandToUpdate) {
                    brandToUpdate = await Brand.findOne({ brandName: b.brandName, companyId: company._id });
                }

                if (brandToUpdate) {
                    // Update existing brand
                    let changed = false;
                    if (b.brandName !== brandToUpdate.brandName) {
                        brandToUpdate.brandName = b.brandName;
                        changed = true;
                    }
                    if (b.brandLogo && b.brandLogo !== brandToUpdate.brandLogo) {
                        brandToUpdate.brandLogo = b.brandLogo;
                        changed = true;
                    }
                    if (b.status && b.status !== brandToUpdate.status) {
                        brandToUpdate.status = b.status;
                        changed = true;
                    }
                    if (changed) await brandToUpdate.save();
                    continue;
                }

                // 3. Create new brand if not found
                const created = await Brand.create({
                    brandName: b.brandName,
                    brandLogo: b.brandLogo || null,
                    companyId: company._id,
                    status: b.status || 'active',
                    createdBy: req.user._id
                });
                newBrands.push(created);
            }
        }

        res.json({ company, newUsers, newBrands });
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
            .populate({
              path: 'companyId',
              select: 'companyName qrCredits planId',
              populate: { path: 'planId' }
            });
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
        
        // Superadmin and Admin users do not have a companyId, return infinite or 0 for UI purposes
        if (['superadmin', 'admin'].includes(user.role)) {
            return res.json({ companyId: null, companyName: 'System Admin', qrCredits: null });
        }

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

        // Calculate total price as pricePerQr * number of QR codes
        const totalPrice = creditsToAdd * (plan.pricePerQr || 0);

        const newBalance = (company.qrCredits || 0) + creditsToAdd;
        company.qrCredits = newBalance;
        company.planId = planId; // Set active plan
        await company.save({ validateModifiedOnly: true });

        await CreditTransaction.create({
            companyId: company._id,
            type: 'purchase_plan',
            amount: creditsToAdd,
            balanceAfter: newBalance,
            unitPrice: plan.pricePerQr || 0,
            totalPaid: totalPrice,
            planName: plan.name,
            performedBy: req.user._id,
            note: 'Purchased plan: ' + plan.name,
        });

        res.json({ message: 'Plan purchased successfully', qrCredits: newBalance, creditsAdded: creditsToAdd, totalPaid: totalPrice });
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

        // Get all credit transactions (completed purchases, spends, grants, refunds)
        const transactions = await CreditTransaction.find(query)
            .populate('performedBy', 'name email mobile role')
            .populate('companyId', 'companyName email phoneNumber supportNumber city country qrCredits')
            .populate('orderId', 'orderId productName quantity')
            .lean();

        // Get all payment attempts (including pending and failed)
        const Payment = require('../models/Payment');
        const payments = await Payment.find(query)
            .populate('performedBy', 'name email mobile role')
            .populate('companyId', 'companyName email phoneNumber supportNumber city country qrCredits')
            .populate('planId', 'name pricePerQr qrCodes')
            .lean();

        // Merge transactions and payments
        const allRecords = [];

        // Add completed transactions with their payment data
        for (const txn of transactions) {
            const payment = payments.find(p => p.creditTransactionId?.toString() === txn._id.toString());
            allRecords.push({
                ...txn,
                recordType: 'transaction',
                payment: payment ? {
                    status: payment.status,
                    phonePeTransactionId: payment.phonePeTransactionId,
                    merchantOrderId: payment.merchantOrderId,
                    finalAmount: payment.finalAmount,
                    baseAmount: payment.baseAmount,
                    gstAmount: payment.gstAmount,
                    gstPercentage: payment.gstPercentage,
                    additionalCharges: payment.additionalCharges,
                    couponCode: payment.couponCode,
                    couponDiscount: payment.couponDiscount,
                } : null
            });
        }

        // Add pending/failed payments that don't have a transaction yet
        for (const payment of payments) {
            if (!payment.creditTransactionId) {
                // This is a pending or failed payment with no completed transaction
                const creditsAmount = payment.type === 'plan' && payment.planId 
                    ? parseInt(String(payment.planId.qrCodes || '0').replace(/[^\d]/g, ''), 10) || 0
                    : payment.quantity || 0;

                allRecords.push({
                    _id: payment._id,
                    recordType: 'payment_only',
                    type: payment.type === 'plan' ? 'purchase_plan' : 'purchase_topup',
                    amount: 0, // No credits added yet
                    balanceAfter: payment.companyId?.qrCredits || 0,
                    unitPrice: payment.type === 'topup' ? 5 : (payment.baseAmount / (creditsAmount || 1)),
                    totalPaid: payment.status === 'completed' ? payment.finalAmount : 0,
                    planName: payment.planId?.name || null,
                    performedBy: payment.performedBy,
                    companyId: payment.companyId,
                    note: `Payment ${payment.status} - ${payment.merchantOrderId}`,
                    createdAt: payment.createdAt,
                    updatedAt: payment.updatedAt,
                    payment: {
                        status: payment.status,
                        phonePeTransactionId: payment.phonePeTransactionId,
                        merchantOrderId: payment.merchantOrderId,
                        finalAmount: payment.finalAmount,
                        baseAmount: payment.baseAmount,
                        gstAmount: payment.gstAmount,
                        gstPercentage: payment.gstPercentage,
                        additionalCharges: payment.additionalCharges,
                        couponCode: payment.couponCode,
                        couponDiscount: payment.couponDiscount,
                    }
                });
            }
        }

        // Sort by date (newest first)
        allRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Apply server-side filters if provided
        let filtered = allRecords;
        if (req.query.type) {
            filtered = filtered.filter(r => r.type === req.query.type);
        }
        if (req.query.paymentStatus) {
            const ps = req.query.paymentStatus;
            filtered = filtered.filter(r => {
                const st = r.payment?.status || 'none';
                return ps === 'all' ? true : st === ps;
            });
        }
        if (req.query.dateFrom) {
            filtered = filtered.filter(r => new Date(r.createdAt) >= new Date(req.query.dateFrom));
        }
        if (req.query.dateTo) {
            filtered = filtered.filter(r => new Date(r.createdAt) <= new Date(req.query.dateTo + 'T23:59:59'));
        }

        // Limit results
        const limited = filtered.slice(0, parseInt(req.query.limit) || 100);

        res.json(limited);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get transaction with payment details for invoice
router.get('/credits/transactions/:transactionId/invoice-data', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { transactionId } = req.params;

        const transaction = await CreditTransaction.findById(transactionId)
            .populate('performedBy', 'name email mobile role')
            .populate('companyId', 'companyName email phoneNumber supportNumber city country qrCredits')
            .populate('orderId', 'orderId productName quantity');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Authorization check
        if (!['superadmin', 'admin'].includes(user.role)) {
            if (!user.companyId || user.companyId.toString() !== transaction.companyId._id.toString()) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
        }

        // Find associated payment if exists
        const Payment = require('../models/Payment');
        const payment = await Payment.findOne({ creditTransactionId: transactionId })
            .populate('planId', 'name pricePerQr qrCodes');

        res.json({ transaction, payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Download invoice PDF
router.get('/credits/transactions/:transactionId/invoice', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { transactionId } = req.params;

        const transaction = await CreditTransaction.findById(transactionId)
            .populate('performedBy', 'name email mobile role')
            .populate('companyId', 'companyName email phoneNumber supportNumber city country qrCredits')
            .populate('orderId', 'orderId productName quantity');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Authorization check
        if (!['superadmin', 'admin'].includes(user.role)) {
            if (!user.companyId || user.companyId.toString() !== transaction.companyId._id.toString()) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
        }

        // Find associated payment if exists
        const Payment = require('../models/Payment');
        const payment = await Payment.findOne({ creditTransactionId: transactionId })
            .populate('planId', 'name pricePerQr qrCodes');

        // Generate invoice PDF
        const { generateInvoicePdf } = require('../utils/invoiceGenerator');
        const pdfBuffer = await generateInvoicePdf(transaction, payment);

        // Set response headers
        const filename = `Invoice_${transaction._id.toString().slice(-8).toUpperCase()}_${new Date(transaction.createdAt).toISOString().split('T')[0]}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);
    } catch (error) {
        console.error('Invoice generation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ========================================
// TEST ACCOUNTS FOR PAYMENT GATEWAY TESTING
// ========================================

const TestAccount = require('../models/TestAccount');

// Get all test accounts (superadmin only)
router.get('/test-accounts', protect, authorize('superadmin'), async (req, res) => {
    try {
        const testAccounts = await TestAccount.find()
            .populate('companyId', 'companyName email phoneNumber')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, testAccounts });
    } catch (error) {
        console.error('Get test accounts error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create test account (superadmin only)
router.post('/test-accounts', protect, authorize('superadmin'), async (req, res) => {
    try {
        const { companyId, testAmount, description } = req.body;
        
        if (!companyId || !testAmount) {
            return res.status(400).json({ 
                success: false, 
                message: 'Company ID and test amount are required' 
            });
        }

        // Check if company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ 
                success: false, 
                message: 'Company not found' 
            });
        }

        // Check if test account already exists for this company
        const existing = await TestAccount.findOne({ companyId });
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: 'Test account already exists for this company' 
            });
        }

        const testAccount = await TestAccount.create({
            companyId,
            testAmount: parseFloat(testAmount),
            description: description || '',
            createdBy: req.user._id,
        });

        const populated = await TestAccount.findById(testAccount._id)
            .populate('companyId', 'companyName email phoneNumber')
            .populate('createdBy', 'name email');

        res.status(201).json({ success: true, testAccount: populated });
    } catch (error) {
        console.error('Create test account error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update test account (superadmin only)
router.put('/test-accounts/:id', protect, authorize('superadmin'), async (req, res) => {
    try {
        const { testAmount, description, isActive } = req.body;
        
        const testAccount = await TestAccount.findById(req.params.id);
        if (!testAccount) {
            return res.status(404).json({ 
                success: false, 
                message: 'Test account not found' 
            });
        }

        if (testAmount !== undefined) testAccount.testAmount = parseFloat(testAmount);
        if (description !== undefined) testAccount.description = description;
        if (isActive !== undefined) testAccount.isActive = isActive;

        await testAccount.save();

        const populated = await TestAccount.findById(testAccount._id)
            .populate('companyId', 'companyName email phoneNumber')
            .populate('createdBy', 'name email');

        res.json({ success: true, testAccount: populated });
    } catch (error) {
        console.error('Update test account error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete test account (superadmin only)
router.delete('/test-accounts/:id', protect, authorize('superadmin'), async (req, res) => {
    try {
        const testAccount = await TestAccount.findById(req.params.id);
        if (!testAccount) {
            return res.status(404).json({ 
                success: false, 
                message: 'Test account not found' 
            });
        }

        await testAccount.deleteOne();
        res.json({ success: true, message: 'Test account deleted successfully' });
    } catch (error) {
        console.error('Delete test account error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Check if current user is a test account
router.get('/test-accounts/check', protect, async (req, res) => {
    try {
        const companyId = req.user.companyId;
        if (!companyId) {
            return res.json({ success: true, isTestAccount: false });
        }

        const testAccount = await TestAccount.findOne({ companyId, isActive: true });
        res.json({ 
            success: true, 
            isTestAccount: !!testAccount,
            testAmount: testAccount?.testAmount || null 
        });
    } catch (error) {
        console.error('Check test account error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========================================
// DYNAMIC FORM CONFIGURATION FOR QR CREATION
// ========================================

// Get form configuration for company (admin/superadmin)
router.get('/form-config', protect, authorize('admin', 'superadmin', 'company', 'authorizer', 'creator'), async (req, res) => {
    try {
        // Fetch global form config
        let formConfig = await FormConfig.findOne({ isGlobal: true, isActive: true })
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        // If no config exists, return default structure
        if (!formConfig) {
            formConfig = {
                isGlobal: true,
                formName: 'QR Creation Form',
                description: '',
                customFields: [],
                staticFields: {
                    brand: { enabled: true, isMandatory: true },
                    mfdOn: { enabled: true, isMandatory: true },
                    bestBefore: { enabled: true, isMandatory: true },
                },
                isActive: true,
            };
        }

        res.json({ success: true, formConfig });
    } catch (error) {
        console.error('Get form config error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create or update global form configuration (admin/superadmin only)
router.post('/form-config', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const { formName, description, customFields, staticFields, variants } = req.body;
        
        // Find existing global config or create new
        let formConfig = await FormConfig.findOne({ isGlobal: true });

        if (formConfig) {
            // Update existing
            formConfig.formName = formName || formConfig.formName;
            formConfig.description = description || formConfig.description;
            formConfig.customFields = customFields || formConfig.customFields;
            formConfig.staticFields = staticFields || formConfig.staticFields;
            // Accept variant updates as well
            if (typeof variants !== 'undefined') {
                formConfig.variants = variants;
            }
            formConfig.updatedBy = req.user._id;
            await formConfig.save();
        } else {
            // Create new global config
            formConfig = await FormConfig.create({
                isGlobal: true,
                formName: formName || 'QR Creation Form',
                description: description || '',
                customFields: customFields || [],
                variants: variants || [],
                staticFields: staticFields || {
                    mfdOn: { enabled: true, isMandatory: true },
                    bestBefore: { enabled: true, isMandatory: true },
                },
                createdBy: req.user._id,
                updatedBy: req.user._id,
            });
        }

        const populated = await FormConfig.findById(formConfig._id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        res.json({ success: true, formConfig: populated });
    } catch (error) {
        console.error('Save form config error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete form configuration (revert to default)
router.delete('/form-config/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const formConfig = await FormConfig.findById(req.params.id);
        if (!formConfig) {
            return res.status(404).json({ 
                success: false, 
                message: 'Form configuration not found' 
            });
        }

        // Admin can only delete their own company's config
        if (req.user.role === 'admin' && req.user.companyId) {
            if (formConfig.companyId.toString() !== req.user.companyId.toString()) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Not authorized to delete this configuration' 
                });
            }
        }

        await formConfig.deleteOne();
        res.json({ success: true, message: 'Form configuration deleted successfully' });
    } catch (error) {
        console.error('Delete form config error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;


