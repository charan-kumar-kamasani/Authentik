const express = require("express");
const Product = require("../models/Product");
const Scan = require("../models/Scan");
const Report = require("../models/Report");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// helper for reverse geocoding (using native fetch — Node 18+)
async function getPlaceFromCoords(lat, lon) {
  if (!lat || !lon) return "Unknown location";

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "Authentik/1.0 (contact@authentik.com)",
        },
      }
    );

    const data = await res.json();

    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      "";

    const state = data.address?.state || "";

    return (
      [city, state].filter(Boolean).join(", ") ||
      "Unknown location"
    );
  } catch {
    return "Unknown location";
  }
}

// Get scan statistics for the current user
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalScans = await Scan.countDocuments({ userId });
    const originalScans = await Scan.countDocuments({ userId, status: "ORIGINAL" });
    const fakeScans = await Scan.countDocuments({ userId, status: "FAKE" });
    const duplicateScans = await Scan.countDocuments({
      userId,
      $or: [{ status: "ALREADY_USED" }, { status: "DUPLICATE" }],
    });

    res.json({
      totalScans,
      authentiks: originalScans,
      counterfeit: fakeScans,
      alert: duplicateScans,
    });
  } catch (err) {
    console.error("Error fetching scan stats:", err);
    res.status(500).json({ error: "Failed to fetch scan stats" });
  }
});

router.get("/history", protect, async (req, res) => {
  try {
    let scans = await Scan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("productId");

    // For any ALREADY_USED scans, include the original scan details (scannedBy, scannedAt, place)
    scans = await Promise.all(
      scans.map(async (s) => {
        const obj = s.toObject ? s.toObject() : s;
        if (obj.status === 'ALREADY_USED' && obj.productId) {
          try {
            // populate mobile (we don't require email for regular users)
            const original = await Scan.findOne({ productId: obj.productId._id, status: 'ORIGINAL' }).populate('userId', 'mobile');
            if (original) {
              obj.originalScan = {
                scannedBy: original.userId ? original.userId.mobile : 'Unknown',
                scannedAt: original.createdAt,
                place: original.place,
              };
            }
          } catch (e) {
            console.warn('Failed to fetch original scan for history item', e);
          }
        }
        return obj;
      })
    );

    res.json(scans);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch scan history" });
  }
});

// Lightweight check endpoint so clients can verify QR existence and active state
router.post("/check", async (req, res) => {
  try {
    const { qrCode } = req.body;
console.log(qrCode)
    if (!qrCode) {
      return res.status(400).json({ error: "qrCode required" });
    }

    const product = await Product.findOne({ qrCode });
 
    if (!product) {
      return res.json({ status: "FAKE", isActive: false, product: null });
    }

    // If product exists but is inactive, return INACTIVE status
    if (!product.isActive) {
      return res.json({ status: "INACTIVE", isActive: false, message: "This QR code is inactive." });
    }

    return res.json({
      status: "FOUND",
      isActive: !!product.isActive,
      product: {
        productId: product._id,
        productName: product.productName,
        brand: product.brand,
        batchNo: product.batchNo,
      },
    });
  } catch (err) {
    console.error("/scan/check error:", err);
    res.status(500).json({ error: "Check failed" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { qrCode, latitude, longitude } = req.body;
    console.log("Scan POST body:", { qrCode, latitude, longitude });

    if (!qrCode) {
      return res.status(400).json({ error: "qrCode is required for scanning." });
    }

    // --- BRAND RESOLUTION (Guess from QR prefix even if product not found) ---
    let brandIdFromPrefix = null;
    let brandNameFromPrefix = null;

    const qrParts = qrCode.split('-');
    if (qrParts.length > 1) {
      const guessedBrand = qrParts[0];
      const Brand = require("../models/Brand");
      const foundBrand = await Brand.findOne({ 
        brandName: { $regex: new RegExp(`^${guessedBrand}$`, "i") } 
      });
      if (foundBrand) {
        brandIdFromPrefix = foundBrand._id;
        brandNameFromPrefix = foundBrand.brandName;
      }
    }

    const place = await getPlaceFromCoords(latitude, longitude);
    const scannedAt = new Date();

    // 1️⃣ Check product
    const product = await Product.findOne({ qrCode });

    // --- We record EVERY attempt, so we skip searching for existingScan here ---

    /* =======================
       ❌ FAKE PRODUCT
    ======================= */
    if (!product) {
      console.log("Record scan: FAKE", { userId, qrCode, brandNameFromPrefix });
      const scan = await Scan.create({
        userId,
        productId: null,
        brandId: brandIdFromPrefix,
        brand: brandNameFromPrefix,
        qrCode: String(qrCode || '').trim(),
        status: "FAKE",
        place,
        latitude,
        longitude,
      });

      return res.json({
        status: "FAKE",
        data: {
          qrCode,
          productId: null,
          productName: null,
          brand: brandNameFromPrefix,
          expiryDate: null,
          place,
          latitude,
          longitude,
          scannedAt: scan.createdAt,
        },
      });
    }

    // Resolve final brand data from product or prefix
    const finalBrandId = product.brandId || brandIdFromPrefix;
    const finalBrandName = product.brand || brandNameFromPrefix;

    /* =======================
       🚫 INACTIVE PRODUCT
    ======================= */
    if (!product.isActive) {
      console.log("Record scan: INACTIVE", { userId, qrCode });
      const scan = await Scan.create({
        userId,
        productId: product._id,
        brandId: finalBrandId,
        brand: finalBrandName,
        qrCode,
        productName: product.productName,
        status: "INACTIVE",
        place,
        latitude,
        longitude,
      });

      return res.json({
        status: "INACTIVE",
        message: "This QR code is inactive.",
        data: {
          qrCode,
          productId: product._id,
          productName: product.productName,
          brand: finalBrandName,
          place,
          scannedAt: scan.createdAt
        }
      });
    }

    // 2️⃣  Has THIS user already scanned this product?
    const myPreviousScan = await Scan.findOne({
      productId: product._id,
      userId: userId,
      status: "ORIGINAL",
    });

    /* =======================
       ✅ SAME USER RE-SCANNING THEIR OWN PRODUCT
    ======================= */
    if (myPreviousScan) {
      // Don't create another record — just return ORIGINAL for their own product
      return res.json({
        status: "ORIGINAL",
        data: {
          qrCode,
          productId: product._id,
          productName: product.productName,
          brand: product.brand || finalBrandName,
          batchNo: product.batchNo,
          manufactureDate: product.manufactureDate,
          expiryDate: product.expiryDate,
          place,
          latitude,
          longitude,
          scannedAt: new Date(),
        },
      });
    }

    // 3️⃣  Has a DIFFERENT user already scanned this product?
    const alreadyUsed = await Scan.findOne({
      productId: product._id,
      userId: { $ne: userId },
      status: "ORIGINAL",
    });

    /* =======================
       ⚠️ ALREADY USED BY ANOTHER USER
    ======================= */
    if (alreadyUsed) {
      await alreadyUsed.populate("userId", "mobile");

      const scan = await Scan.create({
        userId,
        productId: product._id,
        brandId: finalBrandId,
        brand: finalBrandName,
        qrCode,
        productName: product.productName,
        expiryDate: product.expiryDate,
        status: "ALREADY_USED",
        place,
        latitude,
        longitude,
      });

      return res.json({
        status: "ALREADY_USED",
        data: {
          qrCode,
          productId: product._id,
          productName: product.productName,
          brand: product.brand || finalBrandName,
          batchNo: product.batchNo,
          manufactureDate: product.manufactureDate,
          expiryDate: product.expiryDate,
          place,
          latitude,
          longitude,
          scannedAt: scan.createdAt,
          originalScan: {
            scannedBy: alreadyUsed.userId ? alreadyUsed.userId.mobile : "Unknown",
            scannedAt: alreadyUsed.createdAt,
            place: alreadyUsed.place
          }
        },
      });
    }

    /* =======================
       ✅ ORIGINAL (FIRST SCAN)
    ======================= */
    const scan = await Scan.create({
      userId,
      productId: product._id,
      brandId: finalBrandId,
      brand: finalBrandName,
      qrCode,
      productName: product.productName,
      expiryDate: product.expiryDate,
      status: "ORIGINAL",
      place,
      latitude,
      longitude,
    });

    return res.json({
      status: "ORIGINAL",
      data: {
        qrCode,
        productId: product._id,
        productName: product.productName,
        brand: product.brand || finalBrandName,
        batchNo: product.batchNo,
        manufactureDate: product.manufactureDate,
        expiryDate: product.expiryDate,
        place,
        latitude,
        longitude,
        scannedAt: scan.createdAt,
      },
    });
  } catch (err) {
    console.error("Scan storage error:", err);
    res.status(500).json({ error: "Scan failed to save" });
  }
});

// Get all scans for a brand (Company/Admin view)
router.get("/company/all", protect, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'company' || req.user.role === 'authorizer') {
      const bid = req.user.brandId;
      if (!bid) return res.status(403).json({ error: "No brand associated with this user" });
      query = { brandId: bid };
    } else if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Admins can filter by brandId via query param
    if ((req.user.role === 'admin' || req.user.role === 'superadmin') && req.query.brandId) {
      query = { brandId: req.query.brandId };
    }

    const scans = await Scan.find(query)
      .populate('userId', 'name mobile email')
      .populate('productId', 'productName brand batchNo')
      .sort({ createdAt: -1 });

    res.json(scans);
  } catch (err) {
    console.error("Error fetching company scans:", err);
    res.status(500).json({ error: "Failed to fetch scans" });
  }
});

// --- REPORTING SYSTEM ---

// Submit a report
router.post("/report", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Check if user profile is updated (Name and Mobile required)
    const user = await User.findById(userId);
    if (!user.name || !user.mobile) {
      return res.status(400).json({ 
        error: "Profile incomplete", 
        message: "Please update your name and contact details in your profile before reporting." 
      });
    }

    const { productName, brand, description, reportType, images, latitude, longitude, qrCode } = req.body;

    // 2. Check for duplicate report - same user, same QR code
    if (qrCode) {
      const existing = await Report.findOne({ userId, qrCode });
      if (existing) {
        return res.status(400).json({ 
          error: "Duplicate report", 
          message: "You have already submitted a report for this product. Each user can report a product only once." 
        });
      }
    }

    if (!images || !Array.isArray(images) || images.length < 3) {
      return res.status(400).json({ error: "Minimum 3 images required" });
    }

    const place = await getPlaceFromCoords(latitude, longitude);

    const report = await Report.create({
      userId,
      productName,
      brand: brand || "",
      description: description || "",
      reportType: reportType || "COUNTERFEIT",
      images,
      latitude,
      longitude,
      place,
      qrCode,
      status: "Pending"
    });

    res.status(201).json({ 
      success: true, 
      message: "Report submitted successfully. Our team will investigate this.",
      report 
    });
  } catch (err) {
    // Handle MongoDB duplicate key error gracefully
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: "Duplicate report", 
        message: "You have already submitted a report for this product." 
      });
    }
    console.error("Report submission error:", err);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// Get user's reports
router.get("/reports/my", protect, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Get all reports (Admin/Company View)
// If it's a company user, they only see reports for their brands
router.get("/reports/all", protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'company' || req.user.role === 'authorizer') {
      const brandId = req.user.brandId;
      // Resolve brand name from brandId to filter reports
      const Brand = require("../models/Brand");
      const brand = await Brand.findById(brandId);
      if (brand) {
        query.brand = { $regex: new RegExp(brand.brandName, "i") };
      }
      query.reportType = "FAKE"; // Company/Authorizer sees Duplicate/Repeated scans
    } else if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      query.reportType = "COUNTERFEIT"; // Admins see Counterfeit scans initially
    } else {
      return res.status(403).json({ error: "Not authorized" });
    }

    const reports = await Report.find(query).populate('userId', 'name mobile').sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Error fetching all reports:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Toggle counterfeit flag on a report
router.put("/reports/:id/counterfeit", protect, async (req, res) => {
  try {
    if (!['admin', 'superadmin', 'company'].includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    report.isCounterfeit = !report.isCounterfeit;
    await report.save();
    res.json(report);
  } catch (err) {
    console.error("Error toggling counterfeit:", err);
    res.status(500).json({ error: "Failed to update report" });
  }
});

// Update report status
router.put("/reports/:id/status", protect, async (req, res) => {
  try {
    if (!['admin', 'superadmin', 'company'].includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized to update status" });
    }
    const report = await Report.findByIdAndUpdate(
        req.params.id, 
        { status: req.body.status },
        { new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to update report" });
  }
});

module.exports = router;
