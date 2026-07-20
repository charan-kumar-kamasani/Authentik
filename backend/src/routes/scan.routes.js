const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Scan = require("../models/Scan");
const Report = require("../models/Report");
const User = require("../models/User");
const FormConfig = require("../models/FormConfig");
const Review = require("../models/Review");
const ProductCoupon = require("../models/ProductCoupon");
const UserReward = require("../models/UserReward");
const WarrantyClaim = require("../models/WarrantyClaim");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const redisClient = require('../config/redisClient');

// helper for reverse geocoding (using native fetch + Redis Cache)
async function getPlaceFromCoords(lat, lon) {
  if (!lat || !lon) return "Unknown location";
  const cacheKey = `geo:${lat.toFixed(3)},${lon.toFixed(3)}`;

  try {
    // 1. Check Redis Cache
    if (redisClient.isReady) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return cached;
    }

    // 2. Fetch from external API (Slow)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: { "User-Agent": "Authentik/1.0 (contact@authentik.com)" },
        signal: AbortSignal.timeout(1500)
      }
    );

    const data = await res.json();
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
    const state = data.address?.state || "";
    const result = [city, state].filter(Boolean).join(", ") || "Unknown location";
    
    // 3. Save to Redis (Cache for 7 days)
    if (result !== "Unknown location" && redisClient.isReady) {
      await redisClient.setEx(cacheKey, 60 * 60 * 24 * 7, result);
    }

    return result;
  } catch (e) {
    console.error('[GEO SCAN] error:', e.message);
    return "Unknown location";
  }
}

// Get scan statistics for the current user (Optimized with $facet)
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const statsArray = await Scan.aggregate([
      { $match: { userId } },
      {
        $facet: {
          total: [{ $count: "count" }],
          original: [{ $match: { status: "ORIGINAL" } }, { $count: "count" }],
          fake: [{ $match: { status: "FAKE" } }, { $count: "count" }],
          alert: [
            { $match: { status: { $in: ["ALREADY_USED", "DUPLICATE"] } } },
            { $count: "count" }
          ]
        }
      }
    ]);

    const [
      reviewsCount,
      couponsUnlocked,
      couponsAvailable,
      warrantyActive,
      warrantyInactive,
      originalScans,
      userReviews
    ] = await Promise.all([
      Review.countDocuments({ userId }),
      UserReward.countDocuments({ userId }),
      UserReward.find({ userId, isRedeemed: false }).populate('productCouponId', 'discountType discountValue mrp').lean(),
      WarrantyClaim.countDocuments({ userId, status: { $ne: 'Rejected' } }),
      WarrantyClaim.countDocuments({ userId, status: 'Rejected' }),
      Scan.find({ userId, status: 'ORIGINAL' }).select('productId').lean(),
      Review.find({ userId }).select('productId').lean()
    ]);

    const productIds = originalScans.map(s => s.productId);
    const reviewedProductIds = new Set(userReviews.map(r => r.productId?.toString()));
    const unreviewedProductIds = productIds.filter(pid => pid && !reviewedProductIds.has(pid.toString()));

    let pendingRewardValue = 0;
    if (unreviewedProductIds.length > 0) {
      const pendingCoupons = await ProductCoupon.find({ productId: { $in: unreviewedProductIds }, isActive: true }).lean();
      pendingCoupons.forEach(coupon => {
         let value = 0;
         if (coupon.discountType === 'flat' && coupon.discountValue) {
            value = Number(coupon.discountValue);
         } else if (coupon.discountType === 'percentage' && coupon.discountValue && coupon.mrp) {
            value = (Number(coupon.mrp) * Number(coupon.discountValue)) / 100;
         }
         pendingRewardValue += value;
      });
    }

    // Add value of rewards that have been unlocked (reviewed) but not yet redeemed
    unredeemedRewards.forEach(reward => {
       const coupon = reward.productCouponId;
       if (coupon) {
         let value = 0;
         if (coupon.discountType === 'flat' && coupon.discountValue) {
            value = Number(coupon.discountValue);
         } else if (coupon.discountType === 'percentage' && coupon.discountValue && coupon.mrp) {
            value = (Number(coupon.mrp) * Number(coupon.discountValue)) / 100;
         }
         pendingRewardValue += value;
       }
    });

    const stats = statsArray[0] || {};

    res.json({
      totalScans: stats.total?.[0]?.count || 0,
      authentiks: stats.original?.[0]?.count || 0,
      counterfeit: stats.fake?.[0]?.count || 0,
      alert: stats.alert?.[0]?.count || 0,
      activeWarranties: warrantyActive,
      
      rewardsData: {
        totalRewardValue: req.user.walletBalance || 0, // Using user's wallet balance
        pendingRewardValue,
        reviews: {
          submitted: reviewsCount,
          pending: unreviewedProductIds.length
        },
        coupons: {
          unlocked: couponsUnlocked,
          available: unredeemedRewards.length
        },
        warranty: {
          active: warrantyActive,
          inactive: warrantyInactive
        }
      }
    });
  } catch (err) {
    console.error("Error fetching scan stats:", err);
    res.status(500).json({ error: "Failed to fetch scan stats" });
  }
});

router.get("/history", protect, async (req, res) => {
  try {
    const rawScans = await Scan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "productId", populate: { path: "orderId" } })
      .populate({ path: "brandId", populate: { path: "companyId" } })
      .lean();

    // 1. Fetch Global Config ONCE (uses internal cache helper from Phase 2)
    const globalConfig = await FormConfig.getGlobalFormConfig();
    const globalFieldLabels = {};
    if (globalConfig) {
      if (globalConfig.customFields) {
        globalConfig.customFields.forEach(f => {
          if (f.fieldName) {
            const label = f.fieldLabel;
            globalFieldLabels[f.fieldName] = label;
            globalFieldLabels[f.fieldName.toLowerCase()] = label;
            globalFieldLabels[f.fieldName.toUpperCase()] = label;
          }
        });
      }
      if (globalConfig.variants) {
        globalConfig.variants.forEach(f => {
          if (f.variantName) {
            const label = f.variantLabel;
            globalFieldLabels[f.variantName] = label;
            globalFieldLabels[f.variantName.toLowerCase()] = label;
            globalFieldLabels[f.variantName.toUpperCase()] = label;
          }
        });
      }
    }

    // 2. Identify all ALREADY_USED scan productId's to batch-fetch Original scans
    const alreadyUsedProductIds = rawScans
      .filter(s => s.status === 'ALREADY_USED' && s.productId)
      .map(s => s.productId._id);
    
    const originalScansMap = new Map();
    if (alreadyUsedProductIds.length > 0) {
      const originals = await Scan.find({ 
        productId: { $in: alreadyUsedProductIds }, 
        status: 'ORIGINAL' 
      }).populate('userId', 'mobile').lean();
      
      originals.forEach(o => {
        originalScansMap.set(o.productId.toString(), o);
      });
    }

    // 2.5 Fetch user reviews and warranty claims for all these products
    const allProductIds = rawScans.filter(s => s.productId).map(s => s.productId._id);
    
    // Fetch reviews
    const userReviews = await Review.find({ userId: req.user._id, productId: { $in: allProductIds } }).lean();
    const reviewedProductIds = new Set(userReviews.map(r => r.productId.toString()));
    
    // Fetch warranty claims
    const userClaims = await WarrantyClaim.find({ userId: req.user._id, productId: { $in: allProductIds } }).lean();
    const claimStatusMap = new Map();
    userClaims.forEach(c => claimStatusMap.set(c.productId.toString(), c.status));

    // Fetch ProductTemplates
    const allTemplateIds = rawScans
      .filter(s => s.productId && (s.productId.templateId || s.productId.orderId?.templateId))
      .map(s => s.productId.templateId || s.productId.orderId?.templateId);
    
    const ProductTemplate = require("../models/ProductTemplate"); const templates = await ProductTemplate.find({ _id: { $in: allTemplateIds } }).lean();
    const templateMap = new Map();
    templates.forEach(t => templateMap.set(t._id.toString(), t));

    // 3. Process scans with pre-fetched data
    const scans = rawScans.map(s => {
      const obj = s;
      
      // Expose warranty and links at the root level for frontend consistency
      if (obj.productId) {
        obj.warranty = obj.productId.warranty || obj.productId.orderId?.warranty || null;
        obj.orderLinks = obj.productId.orderLinks || obj.productId.orderId?.orderLinks || [];
        obj.alreadyReviewed = reviewedProductIds.has(obj.productId._id.toString());
        obj.warrantyClaimStatus = claimStatusMap.get(obj.productId._id.toString()) || null;
        
        const tId = obj.productId.templateId || obj.productId.orderId?.templateId;
        if (tId) {
          obj.templateData = templateMap.get(tId.toString()) || null;
        }
      }
      
      // Inject companyName
      if (obj.brandId && obj.brandId.companyId) {
        obj.companyName = obj.brandId.companyId.companyName || obj.brandId.companyId.name;
      }

      // Handle ALREADY_USED mapping using map
      if (obj.status === 'ALREADY_USED' && obj.productId) {
        const original = originalScansMap.get(obj.productId._id.toString());
        if (original) {
          let masked = 'Unknown';
          if (original.userId && original.userId.mobile) {
            const m = original.userId.mobile.toString();
            masked = m.length > 2 ? m.slice(0, 3) + '*'.repeat(m.length - 3) + m.slice(-4) : m;
          }
          obj.originalScan = {
            scannedBy: masked,
            scannedAt: original.createdAt,
            place: original.place,
          };
        }
      }
      
      // Resolve field labels (start with global, then override with product-specific)
      const fl = { ...globalFieldLabels };
      if (obj.productId?.variants) {
        obj.productId.variants.forEach(v => {
          if (v.variantName && v.variantLabel) {
            fl[v.variantName] = v.variantLabel;
            fl[v.variantName.toLowerCase()] = v.variantLabel;
            fl[v.variantName.toUpperCase()] = v.variantLabel;
          }
        });
      }
      obj.fieldLabels = fl;

      return obj;
    });

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

    // --- DEMO INTERCEPTOR ---
    if (['DEMO-GENUINE-QR', 'DEMO-DUPLICATE-QR'].includes(qrCode)) {
      const { DEMO_PRODUCT } = require('../utils/demoData');
      return res.json({ status: "FOUND", isActive: true, product: DEMO_PRODUCT });
    }
    if (qrCode === 'DEMO-FAKE-QR') {
      return res.json({ status: "FAKE", isActive: false, product: null });
    }
    // ------------------------

    const product = await Product.findOne({ qrCode })
      .populate('orderId')
      .populate({ path: 'brandId', populate: { path: 'companyId' } })
      .lean();

    // 🔍 WARRANTY DEBUG (check route)
    if (product) {
      console.log('[WARRANTY DEBUG /check] QR:', qrCode);
      console.log('[WARRANTY DEBUG /check] Product.warranty:', JSON.stringify(product.warranty));
      console.log('[WARRANTY DEBUG /check] Order.warranty:', JSON.stringify(product.orderId?.warranty));
      console.log('[WARRANTY DEBUG /check] Final:', JSON.stringify(product.warranty || product.orderId?.warranty || null));
    }

    // Fetch field labels from global config
    const config = await FormConfig.getGlobalFormConfig();
    const fieldLabels = {};
    if (config) {
      if (config.customFields) {
        config.customFields.forEach(f => {
          if (f.fieldName) {
            fieldLabels[f.fieldName] = f.fieldLabel;
            fieldLabels[f.fieldName.toLowerCase()] = f.fieldLabel;
            fieldLabels[f.fieldName.toUpperCase()] = f.fieldLabel;
          }
        });
      }
      if (config.variants) {
        config.variants.forEach(v => {
          if (v.variantName) {
            fieldLabels[v.variantName] = v.variantLabel;
            fieldLabels[v.variantName.toLowerCase()] = v.variantLabel;
            fieldLabels[v.variantName.toUpperCase()] = v.variantLabel;
          }
        });
      }
    }
    
    // Also include labels stored directly on the product's variants (best fallback)
    if (product?.variants) {
      product.variants.forEach(v => {
        if (v.variantName && !fieldLabels[v.variantName]) {
          fieldLabels[v.variantName] = v.variantLabel || v.variantName;
          fieldLabels[v.variantName.toLowerCase()] = v.variantLabel || v.variantName;
          fieldLabels[v.variantName.toUpperCase()] = v.variantLabel || v.variantName;
        }
      });
    }

    // Check if user has already reviewed
    let alreadyReviewed = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET');
        const review = await Review.findOne({ productId: product._id, userId: decoded.userId });
        if (review) alreadyReviewed = true;
      } catch (e) {
        // Token invalid, ignore
      }
    }

    if (!product) {
      return res.json({ 
        status: "FAKE", 
        isActive: false, 
        product: null,
        alertReasons: [
          "Counterfeit or fake product",
          "Tampered or duplicate QR code",
          "Unauthorized manufacturing or distribution",
          "Product not linked with Authentiks protection"
        ]
      });
    }

    // If product exists but is inactive, return INACTIVE status with product details for UI context
    if (!product.isActive) {
      return res.json({ 
        status: "INACTIVE", 
        isActive: false, 
        message: "This QR code is inactive.",
        product: {
          productId: product._id,
          productName: product.productName || product.orderId?.productName,
          companyName: product.brandId?.companyId?.companyName || null,
          brand: product.brand || product.orderId?.brand,
          batchNo: product.batchNo || product.orderId?.batchNo,
          productImage: product.productImage || product.orderId?.productImage,
          category: product.category || product.orderId?.category,
          mrp: product.mrp || product.orderId?.mrp,
          manufacturedBy: product.manufacturedBy || product.orderId?.manufacturedBy,
          marketedBy: product.marketedBy || product.orderId?.marketedBy,
          importMarketedBy: product.importMarketedBy || product.orderId?.importMarketedBy,
          importerRegNo: product.importerRegNo || product.orderId?.importerRegNo,
          countryOfOrigin: product.countryOfOrigin || product.orderId?.countryOfOrigin,
          website: product.website || product.orderId?.website,
          supportEmail: product.supportEmail || product.orderId?.supportEmail || product.dynamicFields?.supportEmail || product.orderId?.dynamicFields?.supportEmail || product.warranty?.supportEmail || product.orderId?.warranty?.supportEmail,
          customerCare: product.customerCare || product.orderId?.customerCare || product.dynamicFields?.customerCare || product.orderId?.dynamicFields?.customerCare || product.warranty?.customerCare || product.orderId?.warranty?.customerCare,
          keyBenefits: product.keyBenefits || product.orderId?.keyBenefits,
          mfdOn: (product.mfdOn?.month) ? product.mfdOn : product.orderId?.mfdOn,
          description: product.description || product.orderId?.description,
          productInfo: product.productInfo || product.orderId?.productInfo,
          bestBefore: (product.bestBefore?.value) ? product.bestBefore : product.orderId?.bestBefore,
          calculatedExpiryDate: product.calculatedExpiryDate || product.orderId?.calculatedExpiryDate,
          dynamicFields: (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : product.orderId?.dynamicFields,
          variants: (product.variants && product.variants.length > 0) ? product.variants : product.orderId?.variants,
          warranty: product.warranty || product.orderId?.warranty || null,
          coupon: product.coupon || product.orderId?.coupon || null,
          educationContent: product.educationContent || product.orderId?.educationContent || [],
          fieldLabels,
          alreadyReviewed,
        }
      });
    }

    return res.json({
      status: "FOUND",
      isActive: !!product.isActive,
      product: {
        productId: product._id,
        productName: product.productName,
        companyName: product.brandId?.companyId?.companyName || null,
        brand: product.brand,
        batchNo: product.batchNo,
        productImage: product.productImage || product.orderId?.productImage,
        category: product.category || product.orderId?.category,
        mrp: product.mrp || product.orderId?.mrp,
        manufacturedBy: product.manufacturedBy || product.orderId?.manufacturedBy,
        marketedBy: product.marketedBy || product.orderId?.marketedBy,
        importMarketedBy: product.importMarketedBy || product.orderId?.importMarketedBy,
        importerRegNo: product.importerRegNo || product.orderId?.importerRegNo,
        countryOfOrigin: product.countryOfOrigin || product.orderId?.countryOfOrigin,
        website: product.website || product.orderId?.website,
        supportEmail: product.supportEmail || product.orderId?.supportEmail || product.dynamicFields?.supportEmail || product.orderId?.dynamicFields?.supportEmail || product.warranty?.supportEmail || product.orderId?.warranty?.supportEmail,
        customerCare: product.customerCare || product.orderId?.customerCare || product.dynamicFields?.customerCare || product.orderId?.dynamicFields?.customerCare || product.warranty?.customerCare || product.orderId?.warranty?.customerCare,
        keyBenefits: product.keyBenefits || product.orderId?.keyBenefits,
        mfdOn: (product.mfdOn?.month) ? product.mfdOn : product.orderId?.mfdOn,
        description: product.description || product.orderId?.description,
        productInfo: product.productInfo || product.orderId?.productInfo,
        bestBefore: (product.bestBefore?.value) ? product.bestBefore : product.orderId?.bestBefore,
        calculatedExpiryDate: product.calculatedExpiryDate || product.orderId?.calculatedExpiryDate,
        dynamicFields: (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : product.orderId?.dynamicFields,
        variants: (product.variants && product.variants.length > 0) ? product.variants : product.orderId?.variants,
        warranty: product.warranty || product.orderId?.warranty || null,
          coupon: product.coupon || product.orderId?.coupon || null,
        educationContent: product.educationContent || product.orderId?.educationContent || [],
        fieldLabels,
        alreadyReviewed,
      },
    });
  } catch (err) {
    console.error("/scan/check error:", err);
    res.status(500).json({ error: "Check failed" });
  }
});

router.post("/", async (req, res, next) => {
  const { qrCode } = req.body;
  // Bypass protect for DEMO QRs
  if (['DEMO-GENUINE-QR', 'DEMO-DUPLICATE-QR', 'DEMO-FAKE-QR'].includes(qrCode)) {
    return next();
  }
  return protect(req, res, next);
}, async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const { qrCode, latitude, longitude } = req.body;
    console.log("Scan POST body:", { qrCode, latitude, longitude });

    if (!qrCode) {
      return res.status(400).json({ error: "qrCode is required for scanning." });
    }

    // --- DEMO INTERCEPTOR ---
    if (['DEMO-GENUINE-QR', 'DEMO-DUPLICATE-QR', 'DEMO-FAKE-QR'].includes(qrCode)) {
      const { getDemoResult } = require('../utils/demoData');
      const place = await getPlaceFromCoords(latitude, longitude);
      return res.json(getDemoResult(qrCode, userId, latitude, longitude, place));
    }
    // ------------------------

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
    const product = await Product.findOne({ qrCode })
      .populate('orderId')
      .populate({ path: 'brandId', populate: { path: 'companyId' } })
      .lean();

    // 🔍 WARRANTY DEBUG LOGS
    if (product) {
      console.log('[WARRANTY DEBUG] QR:', qrCode);
      console.log('[WARRANTY DEBUG] Product._id:', product._id);
      console.log('[WARRANTY DEBUG] Product.warranty:', JSON.stringify(product.warranty));
      console.log('[WARRANTY DEBUG] Product.orderId exists:', !!product.orderId);
      console.log('[WARRANTY DEBUG] Order.warranty:', JSON.stringify(product.orderId?.warranty));
      console.log('[WARRANTY DEBUG] Final warranty value:', JSON.stringify(product.warranty || product.orderId?.warranty || null));
    }

    // Check if user has already reviewed
    let alreadyReviewed = false;
    // We already have req.user from protect middleware
    const review = await Review.findOne({ productId: product?._id, userId: req.user._id }).lean();
    if (review) alreadyReviewed = true;

    // Check if user has already claimed warranty
    let warrantyClaimStatus = null;
    const existingClaim = await WarrantyClaim.findOne({ productId: product?._id, userId: req.user._id }).lean();
    if (existingClaim) {
      warrantyClaimStatus = existingClaim.status;
    }

    // Field Labels for dynamic fields from global configuration
    const config = await FormConfig.getGlobalFormConfig();
    const fieldLabels = {};
    if (config) {
      if (config.customFields) {
        config.customFields.forEach(f => {
          if (f.fieldName) {
            fieldLabels[f.fieldName] = f.fieldLabel;
            fieldLabels[f.fieldName.toLowerCase()] = f.fieldLabel;
            fieldLabels[f.fieldName.toUpperCase()] = f.fieldLabel;
          }
        });
      }
      if (config.variants) {
        config.variants.forEach(v => {
          if (v.variantName) {
            fieldLabels[v.variantName] = v.variantLabel;
            fieldLabels[v.variantName.toLowerCase()] = v.variantLabel;
            fieldLabels[v.variantName.toUpperCase()] = v.variantLabel;
          }
        });
      }
    }
    
    // Also include labels stored directly on the product's variants (best fallback)
    if (product?.variants) {
      product.variants.forEach(v => {
        if (v.variantName && !fieldLabels[v.variantName]) {
          fieldLabels[v.variantName] = v.variantLabel || v.variantName;
          fieldLabels[v.variantName.toLowerCase()] = v.variantLabel || v.variantName;
          fieldLabels[v.variantName.toUpperCase()] = v.variantLabel || v.variantName;
        }
      });
    }

    // --- We record EVERY attempt, so we skip searching for existingScan here ---
    /* =======================
       ❌ FAKE PRODUCT
    ======================= */
    if (!product) {
      return res.json({
        status: "FAKE",
        data: {
          alertReasons: [
            "Counterfeit or fake product",
            "Tampered or duplicate QR code",
            "Unauthorized manufacturing or distribution",
            "Product not linked with Authentiks protection"
          ],
          recommendations: [],
          qrCode,
          productId: null,
          productName: null,
          brand: brandNameFromPrefix,
          expiryDate: null,
          place,
          latitude,
          longitude,
          scannedAt: scannedAt,
          brandId: brandIdFromPrefix,
        },
      });
    }

    // Resolve final brand data from product or prefix
    const finalBrandId = product.brandId?._id || product.brandId || brandIdFromPrefix;
    const finalBrandName = product.brand || brandNameFromPrefix;

    let recommendations = [];
    let templateData = { orderLinks: [], price: null, productInfo: null, description: null, keyBenefits: null, educationContent: [], supportEmail: null, customerCare: null };
    if (finalBrandId) {
      try {
        const ProductTemplate = require("../models/ProductTemplate");
        const matchBrandId = mongoose.isValidObjectId(finalBrandId) 
          ? new mongoose.Types.ObjectId(finalBrandId) 
          : finalBrandId;

        recommendations = await ProductTemplate.find({
          brandId: matchBrandId,
          status: 'active'
        }).limit(4).select("_id productName mrp productImage category discount oldPrice ratingBadge price orderLinks").lean();

        // Also fetch the template for THIS specific product to get its price and orderLinks
        if (product.templateId || product.orderId?.templateId || product.productName) {
           console.log("Searching template for:", product.productName, matchBrandId);
           let query = {};
           if (product.templateId) {
             query = { _id: product.templateId };
           } else if (product.orderId && product.orderId.templateId) {
             query = { _id: product.orderId.templateId };
           } else {
             query = { productName: product.productName, brandId: matchBrandId, status: 'active' };
           }
           
           const template = await ProductTemplate.findOne(query).lean();
           console.log("Found template?", !!template);
           if (template) {
              templateData.orderLinks = template.orderLinks || [];
              templateData.price = template.price || null;
              templateData.mrp = template.mrp || null;
              templateData.category = template.category || null;
              templateData.productImage = template.productImage || null;
              templateData.productInfo = template.productInfo || null;
              templateData.description = template.description || null;
              templateData.keyBenefits = template.keyBenefits || null;
              templateData.dynamicFields = template.dynamicFields || {};
              templateData.variants = template.variants || [];
              templateData.educationContent = template.educationContent || [];
              templateData.supportEmail = template.supportEmail || null;
              templateData.customerCare = template.customerCare || null;
           }
        }
      } catch (err) {
        console.error("Error fetching scan recommendations:", err);
      }
    }

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
          recommendations,
          qrCode,
          productId: product._id,
          brandId: finalBrandId,
          companyName: product.brandId?.companyId?.companyName || null,
          productName: product.productName || product.orderId?.productName,
          brand: finalBrandName,
          batchNo: product.batchNo || product.orderId?.batchNo,
          productImage: product.productImage || product.orderId?.productImage,
          category: product.category || product.orderId?.category,
          mrp: product.mrp || product.orderId?.mrp,
          manufacturedBy: product.manufacturedBy || product.orderId?.manufacturedBy,
          marketedBy: product.marketedBy || product.orderId?.marketedBy,
          importMarketedBy: product.importMarketedBy || product.orderId?.importMarketedBy,
          importerRegNo: product.importerRegNo || product.orderId?.importerRegNo,
          countryOfOrigin: product.countryOfOrigin || product.orderId?.countryOfOrigin,
          website: product.website || product.orderId?.website,
          supportEmail: product.supportEmail || product.orderId?.supportEmail || product.dynamicFields?.supportEmail || product.orderId?.dynamicFields?.supportEmail || product.warranty?.supportEmail || product.orderId?.warranty?.supportEmail || templateData.supportEmail,
          customerCare: product.customerCare || product.orderId?.customerCare || product.dynamicFields?.customerCare || product.orderId?.dynamicFields?.customerCare || product.warranty?.customerCare || product.orderId?.warranty?.customerCare || templateData.customerCare,
          keyBenefits: product.keyBenefits || product.orderId?.keyBenefits || templateData.keyBenefits,
          mfdOn: (product.mfdOn?.month) ? product.mfdOn : product.orderId?.mfdOn,
          description: product.description || product.orderId?.description || templateData.description,
          productInfo: product.productInfo || product.orderId?.productInfo || templateData.productInfo,
          bestBefore: (product.bestBefore?.value) ? product.bestBefore : product.orderId?.bestBefore,
          calculatedExpiryDate: product.calculatedExpiryDate || product.orderId?.calculatedExpiryDate,
          dynamicFields: (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : product.orderId?.dynamicFields,
          variants: (product.variants && product.variants.length > 0) ? product.variants : product.orderId?.variants,
          warranty: product.warranty || product.orderId?.warranty || null,
          coupon: product.coupon || product.orderId?.coupon || null,
          educationContent: product.educationContent || product.orderId?.educationContent || templateData.educationContent || [],
          fieldLabels,
          alreadyReviewed,
          warrantyClaimStatus,
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
          recommendations,
          qrCode,
          productId: product._id,
          companyName: product.brandId?.companyId?.companyName || null,
          productName: product.productName || product.orderId?.productName,
          brand: product.brand || finalBrandName,
          batchNo: product.batchNo || product.orderId?.batchNo,
          manufactureDate: product.manufactureDate || product.orderId?.manufactureDate,
          expiryDate: product.expiryDate || product.orderId?.expiryDate,
          productImage: product.productImage || product.orderId?.productImage || templateData.productImage,
          category: product.category || product.orderId?.category || templateData.category,
          mrp: product.mrp || product.orderId?.mrp || templateData.mrp,
          manufacturedBy: product.manufacturedBy || product.orderId?.manufacturedBy,
          marketedBy: product.marketedBy || product.orderId?.marketedBy,
          importMarketedBy: product.importMarketedBy || product.orderId?.importMarketedBy,
          importerRegNo: product.importerRegNo || product.orderId?.importerRegNo,
          countryOfOrigin: product.countryOfOrigin || product.orderId?.countryOfOrigin,
          website: product.website || product.orderId?.website,
          supportEmail: product.supportEmail || product.orderId?.supportEmail || product.dynamicFields?.supportEmail || product.orderId?.dynamicFields?.supportEmail || product.warranty?.supportEmail || product.orderId?.warranty?.supportEmail || templateData.supportEmail,
          customerCare: product.customerCare || product.orderId?.customerCare || product.dynamicFields?.customerCare || product.orderId?.dynamicFields?.customerCare || product.warranty?.customerCare || product.orderId?.warranty?.customerCare || templateData.customerCare,
          keyBenefits: product.keyBenefits || product.orderId?.keyBenefits || templateData.keyBenefits,
          mfdOn: (product.mfdOn?.month) ? product.mfdOn : product.orderId?.mfdOn,
          description: product.description || product.orderId?.description || templateData.description,
          productInfo: product.productInfo || product.orderId?.productInfo || templateData.productInfo,
          bestBefore: (product.bestBefore?.value) ? product.bestBefore : product.orderId?.bestBefore,
          calculatedExpiryDate: product.calculatedExpiryDate || product.orderId?.calculatedExpiryDate,
          dynamicFields: (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : ((product.orderId?.dynamicFields && product.orderId.dynamicFields.size > 0) ? product.orderId.dynamicFields : templateData.dynamicFields),
          variants: (product.variants && product.variants.length > 0) ? product.variants : ((product.orderId?.variants && product.orderId.variants.length > 0) ? product.orderId.variants : templateData.variants),
          warranty: product.warranty || product.orderId?.warranty || null,
          coupon: product.coupon || product.orderId?.coupon || null,
          educationContent: product.educationContent || product.orderId?.educationContent || templateData.educationContent || [],
          orderLinks: (product.orderLinks && product.orderLinks.length > 0) ? product.orderLinks : ((product.orderId?.orderLinks && product.orderId.orderLinks.length > 0) ? product.orderId.orderLinks : templateData.orderLinks),
          price: product.price || templateData.price,
        fieldLabels,
          alreadyReviewed,
          warrantyClaimStatus,
          place,
          latitude,
          longitude,
          scannedAt: new Date(),
          hasCoupon: !!(await ProductCoupon.findOne({ productId: product._id, isActive: true }).lean()),
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

      // Mask mobile
      let masked = 'Unknown';
      if (alreadyUsed.userId && alreadyUsed.userId.mobile) {
        const m = alreadyUsed.userId.mobile.toString();
        masked = m.length > 5 ? m.slice(0, 3) + '*'.repeat(m.length - 5) + m.slice(-2) : m;
      }

      return res.json({
        status: "ALREADY_USED",
        data: {
          alertReasons: [
            "Product sharing or resale",
            "Unauthorized distribution",
            "Potential counterfeit activity"
          ],
          recommendations,
          qrCode,
          productId: product._id,
          brandId: finalBrandId,
          companyName: product.brandId?.companyId?.companyName || null,
          productName: product.productName || product.orderId?.productName,
          brand: product.brand || finalBrandName,
          batchNo: product.batchNo || product.orderId?.batchNo,
          manufactureDate: product.manufactureDate || product.orderId?.manufactureDate,
          expiryDate: product.expiryDate || product.orderId?.expiryDate,
          productImage: product.productImage || product.orderId?.productImage || templateData.productImage,
          category: product.category || product.orderId?.category || templateData.category,
          mrp: product.mrp || product.orderId?.mrp || templateData.mrp,
          manufacturedBy: product.manufacturedBy || product.orderId?.manufacturedBy,
          marketedBy: product.marketedBy || product.orderId?.marketedBy,
          importMarketedBy: product.importMarketedBy || product.orderId?.importMarketedBy,
          importerRegNo: product.importerRegNo || product.orderId?.importerRegNo,
          countryOfOrigin: product.countryOfOrigin || product.orderId?.countryOfOrigin,
          website: product.website || product.orderId?.website,
          supportEmail: product.supportEmail || product.orderId?.supportEmail || product.dynamicFields?.supportEmail || product.orderId?.dynamicFields?.supportEmail || product.warranty?.supportEmail || product.orderId?.warranty?.supportEmail || templateData.supportEmail,
          customerCare: product.customerCare || product.orderId?.customerCare || product.dynamicFields?.customerCare || product.orderId?.dynamicFields?.customerCare || product.warranty?.customerCare || product.orderId?.warranty?.customerCare || templateData.customerCare,
          keyBenefits: product.keyBenefits || product.orderId?.keyBenefits || templateData.keyBenefits,
          mfdOn: (product.mfdOn?.month) ? product.mfdOn : product.orderId?.mfdOn,
          description: product.description || product.orderId?.description || templateData.description,
          productInfo: product.productInfo || product.orderId?.productInfo || templateData.productInfo,
          bestBefore: (product.bestBefore?.value) ? product.bestBefore : product.orderId?.bestBefore,
          calculatedExpiryDate: product.calculatedExpiryDate || product.orderId?.calculatedExpiryDate,
          dynamicFields: (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : ((product.orderId?.dynamicFields && product.orderId.dynamicFields.size > 0) ? product.orderId.dynamicFields : templateData.dynamicFields),
          variants: (product.variants && product.variants.length > 0) ? product.variants : ((product.orderId?.variants && product.orderId.variants.length > 0) ? product.orderId.variants : templateData.variants),
          warranty: product.warranty || product.orderId?.warranty || null,
          coupon: product.coupon || product.orderId?.coupon || null,
          educationContent: product.educationContent || product.orderId?.educationContent || templateData.educationContent || [],
          orderLinks: (product.orderLinks && product.orderLinks.length > 0) ? product.orderLinks : ((product.orderId?.orderLinks && product.orderId.orderLinks.length > 0) ? product.orderId.orderLinks : templateData.orderLinks),
          price: product.price || templateData.price,
          fieldLabels,
          alreadyReviewed,
          warrantyClaimStatus,
          place,
          scannedAt: scan.createdAt,
          originalScan: {
            scannedBy: masked,
            scannedAt: alreadyUsed.createdAt,
            place: alreadyUsed.place,
          }
        },
      });
    }

    /* =======================
       ✅ ORIGINAL (FIRST SCAN)
    ======================= */
    // --- CASHBACK LOGIC ---
    let cashbackAwarded = 0;
    if (product.orderId && product.orderId.cashback && product.orderId.cashback.isActive) {
      const cashbackData = product.orderId.cashback;
      const remainingFund = cashbackData.totalFund - cashbackData.disbursed;
      
      if (remainingFund > 0 && remainingFund >= cashbackData.minPerUser) {
        const maxPossible = Math.min(cashbackData.maxPerUser, remainingFund);
        const randomAmount = Math.floor(Math.random() * (maxPossible - cashbackData.minPerUser + 1)) + cashbackData.minPerUser;
        
        cashbackAwarded = randomAmount;
        
        // Update Order disbursed amount
        const Order = require('../models/Order');
        await Order.findByIdAndUpdate(product.orderId._id, {
          $inc: { 'cashback.disbursed': cashbackAwarded }
        });

        // Update User wallet balance
        const User = require('../models/User');
        await User.findByIdAndUpdate(userId, {
          $inc: { walletBalance: cashbackAwarded }
        });
      }
    }

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
      cashbackAwarded,
    });

    let loyaltyPointsAwarded = 0;
    if (product.orderId && product.orderId.loyalty && product.orderId.loyalty.isActive) {
      const loyaltyData = product.orderId.loyalty;
      const remainingPointsFund = loyaltyData.totalPointsFund - loyaltyData.pointsDisbursed;
      
      if (remainingPointsFund > 0 && remainingPointsFund >= loyaltyData.pointsPerScan) {
        loyaltyPointsAwarded = loyaltyData.pointsPerScan;
        
        // Update Order disbursed points
        const Order = require('../models/Order');
        await Order.findByIdAndUpdate(product.orderId._id, {
          $inc: { 'loyalty.pointsDisbursed': loyaltyPointsAwarded }
        });

        // Update User loyalty balance
        const User = require('../models/User');
        await User.findByIdAndUpdate(userId, {
          $inc: { loyaltyPoints: loyaltyPointsAwarded }
        });
      }
    }

    if (cashbackAwarded > 0) {
      const WalletTransaction = require('../models/WalletTransaction');
      await WalletTransaction.create({
        userId,
        amount: cashbackAwarded,
        currency: 'INR',
        type: 'cashback_earned',
        scanId: scan._id,
        orderId: product.orderId._id,
        description: `Cashback earned from scanning ${product.productName || 'product'} QR code.`
      });
    }

    if (loyaltyPointsAwarded > 0) {
      const WalletTransaction = require('../models/WalletTransaction');
      await WalletTransaction.create({
        userId,
        amount: loyaltyPointsAwarded,
        currency: 'POINTS',
        type: 'points_earned',
        scanId: scan._id,
        orderId: product.orderId._id,
        description: `Loyalty points earned from scanning ${product.productName || 'product'} QR code.`
      });
    }


    return res.json({
      status: "ORIGINAL",
      data: {
        recommendations,
        qrCode,
        productId: product._id,
        brandId: finalBrandId,
        companyName: product.brandId?.companyId?.companyName || null,
        productName: product.productName || product.orderId?.productName,
        brand: product.brand || finalBrandName,
        batchNo: product.batchNo || product.orderId?.batchNo,
        manufactureDate: product.manufactureDate || product.orderId?.manufactureDate,
        expiryDate: product.expiryDate || product.orderId?.expiryDate,
        productImage: product.productImage || product.orderId?.productImage || templateData.productImage,
        category: product.category || product.orderId?.category || templateData.category,
        mrp: product.mrp || product.orderId?.mrp || templateData.mrp,
        manufacturedBy: product.manufacturedBy || product.orderId?.manufacturedBy,
        marketedBy: product.marketedBy || product.orderId?.marketedBy,
        importMarketedBy: product.importMarketedBy || product.orderId?.importMarketedBy,
        importerRegNo: product.importerRegNo || product.orderId?.importerRegNo,
        countryOfOrigin: product.countryOfOrigin || product.orderId?.countryOfOrigin,
        website: product.website || product.orderId?.website,
        supportEmail: product.supportEmail || product.orderId?.supportEmail || product.dynamicFields?.supportEmail || product.orderId?.dynamicFields?.supportEmail || product.warranty?.supportEmail || product.orderId?.warranty?.supportEmail || templateData.supportEmail,
        customerCare: product.customerCare || product.orderId?.customerCare || product.dynamicFields?.customerCare || product.orderId?.dynamicFields?.customerCare || product.warranty?.customerCare || product.orderId?.warranty?.customerCare || templateData.customerCare,
        mfdOn: (product.mfdOn?.month) ? product.mfdOn : product.orderId?.mfdOn,
        description: product.description || product.orderId?.description || templateData.description,
        productInfo: product.productInfo || product.orderId?.productInfo || templateData.productInfo,
        bestBefore: (product.bestBefore?.value) ? product.bestBefore : product.orderId?.bestBefore,
        calculatedExpiryDate: product.calculatedExpiryDate || product.orderId?.calculatedExpiryDate,
        dynamicFields: (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : ((product.orderId?.dynamicFields && product.orderId.dynamicFields.size > 0) ? product.orderId.dynamicFields : templateData.dynamicFields),
        variants: (product.variants && product.variants.length > 0) ? product.variants : ((product.orderId?.variants && product.orderId.variants.length > 0) ? product.orderId.variants : templateData.variants),
        warranty: product.warranty || product.orderId?.warranty || null,
          coupon: product.coupon || product.orderId?.coupon || null,
        keyBenefits: product.keyBenefits || product.orderId?.keyBenefits || templateData.keyBenefits,
        orderLinks: (product.orderLinks && product.orderLinks.length > 0) ? product.orderLinks : ((product.orderId?.orderLinks && product.orderId.orderLinks.length > 0) ? product.orderId.orderLinks : templateData.orderLinks),
        price: product.price || templateData.price,
        educationContent: product.educationContent || product.orderId?.educationContent || templateData.educationContent || [],
        fieldLabels,
        alreadyReviewed,
        warrantyClaimStatus,
        place,
        latitude,
        longitude,
        scannedAt: scan.createdAt,
        hasCoupon: !!(await ProductCoupon.findOne({ productId: product._id, isActive: true }).lean()),
        cashbackAwarded,
        loyaltyPointsAwarded,
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
      .sort({ createdAt: -1 })
      .lean();

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
    const user = req.user; // Already populated by protect
    if (!user.name || !user.mobile) {
      return res.status(400).json({ 
        error: "Profile incomplete", 
        message: "Please update your name and contact details in your profile before reporting." 
      });
    }

    const { productName, brand, description, reportType, images, latitude, longitude, qrCode, productId, brandId, scanStatus } = req.body;

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

    // Create report with scan data
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
      status: "Pending",
      scanData: {
        productId: productId || null,
        brandId: brandId || null,
        scanStatus: scanStatus || "FAKE",
        scannedAt: new Date(),
      },
    });

    // NOW create the scan record (only when report is submitted)
    if (scanStatus === "FAKE" || scanStatus === "ALREADY_USED") {
      try {
        await Scan.create({
          userId,
          productId: productId || null,
          brandId: brandId || null,
          brand: brand || "",
          qrCode: qrCode,
          productName: productName,
          status: scanStatus,
          place,
          latitude,
          longitude,
        });
        console.log("Scan record created during report submission");
      } catch (scanErr) {
        console.warn("Failed to create scan record:", scanErr.message);
        // Don't fail the report if scan creation fails
      }
    }

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
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Get all reports (Admin/Company View) with user population
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

    const reports = await Report.find(query).populate('userId', 'name mobile').sort({ createdAt: -1 }).lean();
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


// Get brand details
router.get("/brand/:brandId", async (req, res) => {
  try {
    const Brand = require("../models/Brand");
    const { brandId } = req.params;
    
    if (brandId === "0000000000000000000bdemo") {
      return res.json({
        _id: brandId,
        brandName: "Origin Nutrition",
        brandLogo: "https://origin-nutrition.com/wp-content/uploads/2021/05/origin-logo-1.png",
        industry: "Health & Supplements",
        companyId: { companyName: "Origin Nutrition Official" }
      });
    }

    let brand = await Brand.findById(brandId).populate('companyId').lean();
    
    // If not found by Brand ID, check if it's a Company ID
    if (!brand) {
      brand = await Brand.findOne({ companyId: brandId }).populate('companyId').lean();
    }
    
    // If still not found, construct a synthetic brand using the Company
    if (!brand) {
      const Company = require("../models/Company");
      const company = await Company.findById(brandId).lean();
      if (company) {
        brand = {
          _id: company._id,
          brandName: company.companyName,
          industry: company.industry,
          companyId: company
        };
      }
    }

    if (!brand) return res.status(404).json({ error: "Brand not found" });

    res.json(brand);
  } catch (err) {
    console.error("Error fetching brand:", err);
    res.status(500).json({ error: "Failed to fetch brand" });
  }
});

// Get user usage stats for a brand's featured product
router.get("/user-stats/:brandId", protect, async (req, res) => {
  try {
    const { brandId } = req.params;
    const Product = require("../models/Product");
    const Coupon = require("../models/Coupon");
    const User = require("../models/User");

    // Get featured product for this brand
    const featuredProduct = await Product.findOne({ brandId, isActive: true })
      .sort({ createdAt: -1 })
      .select("_id totalServings servingSize averageUsagePerWeek");

    if (!featuredProduct) {
      return res.json({ hasStats: false, message: "No active products found for this brand." });
    }

    // Get total valid coupons
    const activeCouponsCount = await Coupon.countDocuments({ isActive: true });

    // Check user's purchase history for this product
    const user = await User.findById(req.user.id);
    const purchase = user?.purchaseHistory?.find(
      (p) => p.productId && p.productId.toString() === featuredProduct._id.toString()
    );

    if (!purchase) {
      // User hasn't purchased it yet
      return res.json({
        hasStats: false,
        couponCount: activeCouponsCount
      });
    }

    // Calculate usage data
    const { lastPurchasedDate, quantity, servingsRemaining } = purchase;
    const totalServings = featuredProduct.totalServings ;
    const averageUsagePerWeek = featuredProduct.averageUsagePerWeek ;
    const servingSize = featuredProduct.servingSize ;
    
    // Calculate percentage left
    const usagePercent = Math.round((servingsRemaining / totalServings) * 100);

    // Calculate next reorder date
    let nextReorderDate = null;
    let daysUntilReorder = null;
    
    if (averageUsagePerWeek > 0) {
      const weeksRemaining = servingsRemaining / averageUsagePerWeek;
      const daysRemaining = Math.floor(weeksRemaining * 7);
      
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysRemaining);
      nextReorderDate = targetDate.toISOString();
      daysUntilReorder = daysRemaining;
    }

    res.json({
      hasStats: true,
      couponCount: activeCouponsCount,
      usage: {
        servingsRemaining,
        totalServings,
        usagePercent,
        averageUsagePerWeek,
        lastPurchasedDate: lastPurchasedDate.toISOString(),
        lastQuantity: `${quantity} x ${servingSize}`,
        nextReorderDate,
        daysUntilReorder
      }
    });

  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

// Get all recommendations (products) for a specific brand
router.get("/recommendations/:brandId", async (req, res) => {
  try {
    const ProductTemplate = require("../models/ProductTemplate");
    const { brandId } = req.params;
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { brandId: brandId },
        { companyId: brandId }
      ],
      status: 'active'
    };

    const totalItems = await ProductTemplate.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const sortParam = req.query.sort || 'newest';
    let sortObj = { displayOrder: 1, createdAt: -1 };
    if (sortParam === 'price_low') sortObj = { price: 1 };
    else if (sortParam === 'price_high') sortObj = { price: -1 };
    else if (sortParam === 'oldest') sortObj = { createdAt: 1 };

    const products = await ProductTemplate.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();
    
    res.json({
      products,
      totalPages,
      currentPage: page,
      totalItems
    });
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

module.exports = router;
// Smart Reorder Route (Add to scan.routes.js)
router.get("/smart-reorder/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const Product = require("../models/Product");
    const ProductTemplate = require("../models/ProductTemplate");

    const product = await Product.findById(productId).populate({
      path: 'brandId',
      populate: { path: 'companyId' }
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Try to find the ProductTemplate
    let templateData = null;
    if (product.brandId) {
      templateData = await ProductTemplate.findOne({
        productName: product.productName,
        brandId: product.brandId._id,
        status: 'active'
      }).lean();
    }

    // Build the dynamic payload
    const orderLinks = (product.orderLinks && product.orderLinks.length > 0) ? product.orderLinks : (templateData?.orderLinks || []);
    const price = product.price || templateData?.price || null;
    const mrp = product.mrp || templateData?.mrp || null;

    // We can extract custom 'usage' related dynamic fields
    const dynamicFields = (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : (templateData?.dynamicFields || {});

    // You can also check if the user is authenticated and get their purchase history for this product
    // For now, return standard product stats
    const responseData = {
      productId: product._id,
      productName: product.productName,
      productImage: product.productImage || templateData?.productImage,
      brand: product.brand || product.brandId?.brandName,
      companyName: product.brandId?.companyId?.companyName,
      variants: product.variants || templateData?.variants || [],
      orderLinks,
      price,
      mrp,
      dynamicFields,
      // For usage tracking UI
      createdAt: product.createdAt,
      expiryDate: product.expiryDate || product.calculatedExpiryDate
    };

    res.json(responseData);
  } catch (err) {
    console.error("Error fetching smart reorder data:", err);
    res.status(500).json({ error: "Failed to fetch smart reorder data" });
  }
});
