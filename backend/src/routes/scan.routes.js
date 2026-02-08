const express = require("express");
const Product = require("../models/Product");
const Scan = require("../models/Scan");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// helper for reverse geocoding
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function getPlaceFromCoords(lat, lon) {
  if (!lat || !lon) return "Unknown location";

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "Authentick/1.0 (contact@authentick.com)",
        },
      }
    );

    const data = await res.json();

    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      "";

    const state = data.address?.state || "";
    const country = data.address?.country || "";

    return (
      [city, state, country].filter(Boolean).join(", ") ||
      "Unknown location"
    );
  } catch {
    return "Unknown location";
  }
}

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

    if (!qrCode) {
      return res.status(400).json({ error: "qrCode required" });
    }

    const product = await Product.findOne({ qrCode });
 
    if (!product) {
      return res.json({ status: "FAKE", isActive: false, product: null });
    }

    // If product exists but is inactive, do NOT return product details.
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

    const place = await getPlaceFromCoords(latitude, longitude);
    const scannedAt = new Date();

    // 1️⃣ Check product
    const product = await Product.findOne({ qrCode });

    // 1.a️⃣ Prevent duplicate scans for the same user + qrCode/product
    // If a scan already exists for this user and this QR (or product), return it instead of creating a duplicate.
    let existingScan = null;
    if (product) {
      existingScan = await Scan.findOne({ userId, productId: product._id });
    } else {
      existingScan = await Scan.findOne({ userId, qrCode });
    }

    if (existingScan) {
      // if product exists, populate productId for richer response
      if (existingScan.productId) await existingScan.populate('productId');

      // Build response matching the shape used elsewhere
      if (existingScan.status === 'FAKE') {
        return res.json({
          status: 'FAKE',
          data: {
            qrCode: existingScan.qrCode,
            productId: null,
            productName: existingScan.productName || null,
            expiryDate: existingScan.expiryDate || null,
            place: existingScan.place,
            latitude: existingScan.latitude,
            longitude: existingScan.longitude,
            scannedAt: existingScan.createdAt,
          }
        });
      }

        if (existingScan.status === 'ALREADY_USED') {
        // find the original scanner for this product and return mobile instead of email
        const original = await Scan.findOne({ productId: existingScan.productId, status: 'ORIGINAL' }).populate('userId', 'mobile');
        return res.json({
          status: 'ALREADY_USED',
          data: {
            qrCode: existingScan.qrCode,
            productId: existingScan.productId?._id || existingScan.productId,
            productName: existingScan.productName,
            brand: existingScan.productId?.brand || undefined,
            batchNo: existingScan.productId?.batchNo || undefined,
            manufactureDate: existingScan.productId?.manufactureDate || undefined,
            expiryDate: existingScan.expiryDate,
            place: existingScan.place,
            latitude: existingScan.latitude,
            longitude: existingScan.longitude,
            scannedAt: existingScan.createdAt,
            originalScan: original ? {
              scannedBy: original.userId ? original.userId.mobile : 'Unknown',
              scannedAt: original.createdAt,
              place: original.place
            } : null
          }
        });
      }

      // ORIGINAL
      if (existingScan.status === 'ORIGINAL') {
        return res.json({
          status: 'ORIGINAL',
          data: {
            qrCode: existingScan.qrCode,
            productId: existingScan.productId?._id || existingScan.productId,
            productName: existingScan.productName,
            brand: existingScan.productId?.brand || undefined,
            batchNo: existingScan.productId?.batchNo || undefined,
            manufactureDate: existingScan.productId?.manufactureDate || undefined,
            expiryDate: existingScan.expiryDate,
            place: existingScan.place,
            latitude: existingScan.latitude,
            longitude: existingScan.longitude,
            scannedAt: existingScan.createdAt,
          }
        });
      }
    }

   /* =======================
     ❌ FAKE PRODUCT
   ======================= */
   if (!product) {
      const scan = await Scan.create({
        userId,
        productId: null,
        qrCode,
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
          expiryDate: null,
          place,
          latitude,
          longitude,
          scannedAt: scan.createdAt,
        },
      });
    }

    // If QR exists but is not active, return INACTIVE without creating a scan
    if (product && !product.isActive) {
      // Return a minimal response with no QR/product/place details
      return res.json({
        status: "INACTIVE",
        message: "This QR code is inactive.",
      });
    }

    // 2️⃣ Check if already used
    const alreadyUsed = await Scan.findOne({
      productId: product._id,
      status: "ORIGINAL",
    });

    /* =======================
       ⚠️ ALREADY USED
    ======================= */
    if (alreadyUsed) {
      // Fetch user details of the original scanner (mobile only)
      await alreadyUsed.populate("userId", "mobile"); 
      
      const scan = await Scan.create({
        userId,
        productId: product._id,
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
          brand: product.brand,
          batchNo: product.batchNo,
          manufactureDate: product.manufactureDate,
          expiryDate: product.expiryDate,
          place,
          latitude,
          longitude,
          scannedAt: scan.createdAt,
          // History of Original Scan
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
        brand: product.brand,
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
    console.error(err);
    res.status(500).json({ error: "Scan failed" });
  }
});

module.exports = router;
