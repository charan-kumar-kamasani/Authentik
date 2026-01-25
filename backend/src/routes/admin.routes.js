const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");
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
      token: jwt.sign({ userId: user._id }, "SECRET", { expiresIn: "30d" }),
    });
  } else {
    res.status(401).json({ error: "Invalid email or password" });
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

// Create QR (Product) with Auto-Generation
router.post(
  "/create-qr",
  protect,
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

        const product = await Product.create({
          qrCode,
          productName,
          brand,
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
        const pdfBase64 = await generateQrPdf(createdProducts, req.user.email);
        res.status(201).json({ products: createdProducts, count: createdProducts.length, pdfBase64 });
    } catch (e) {
        console.error("PDF Gen Error", e);
        res.status(201).json({ products: createdProducts, count: createdProducts.length, pdfBase64: null }); 
    }
  }

);

// Bulk Upload QRs
router.post(
  "/bulk-upload-qrs",
  protect,
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

        const newProduct = await Product.create({
            qrCode,
            productName,
            brand,
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
        const pdfBase64 = await generateQrPdf(results, req.user.email);
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
router.get("/qrs", protect, authorize("admin", "manager", "superadmin"), async (req, res) => {
    let query = {};
    
    if (req.user.role === 'manager') {
        query = { createdBy: req.user._id };
    } else if (req.user.role === 'admin') {
         query = { createdBy: req.user._id };
    } 
    if (req.user.role === 'superadmin') {
        query = {}; 
    }

    const products = await Product.find(query).populate('createdBy', 'email role');
    res.json(products);
});

module.exports = router;
