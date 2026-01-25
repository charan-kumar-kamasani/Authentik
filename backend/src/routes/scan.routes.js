const express = require("express");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const Scan = require("../models/Scan");

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

router.post("/", async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { userId } = jwt.verify(token, "SECRET");

    const { qrCode, latitude, longitude } = req.body;

    const place = await getPlaceFromCoords(latitude, longitude);
    const scannedAt = new Date();

    // 1️⃣ Check product
    const product = await Product.findOne({ qrCode });

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

    // 2️⃣ Check if already used
    const alreadyUsed = await Scan.findOne({
      productId: product._id,
      status: "ORIGINAL",
    });

    /* =======================
       ⚠️ ALREADY USED
    ======================= */
    if (alreadyUsed) {
      // Fetch user details of the original scanner
      await alreadyUsed.populate("userId", "email"); 
      
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
              scannedBy: alreadyUsed.userId ? alreadyUsed.userId.email : "Unknown",
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
