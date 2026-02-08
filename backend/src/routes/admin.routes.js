const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const Company = require("../models/Company");
const { protect, authorize } = require("../middleware/authMiddleware");
const { generateQrPdf } = require("../utils/pdfGenerator");

const router = express.Router();

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
            legalEntity,
            companyWebsite,
            industry,
            country,
            city,
            cinGst,
            registerOfficeAddress,
            dispatchAddress,
            email,
            phoneNumber,
            contactPersonName,
            brands // optional array: [{ brandName, brandLogo }, ...]
        } = req.body;

        if (!companyName || !legalEntity) {
            return res.status(400).json({ message: 'companyName and legalEntity are required' });
        }

        const company = await Company.create({
            companyName,
            legalEntity,
            companyWebsite,
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

        res.status(201).json({ company, brands: createdBrands });
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
            .populate('companyId', 'companyName');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;


