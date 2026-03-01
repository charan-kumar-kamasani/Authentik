const express = require('express');
const router = express.Router();
const Feature = require('../models/Feature');
const PricePlan = require('../models/PricePlan');
const BillingConfig = require('../models/BillingConfig');
const Setting = require('../models/Setting');
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/authMiddleware');

const superAdminCheck = (req, res, next) => {
    if (!['superadmin', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

router.get('/features', async (req, res) => {
    try {
        const features = await Feature.find().sort({ createdAt: 1 });
        res.json(features);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/features', protect, superAdminCheck, async (req, res) => {
    try {
        const feature = new Feature(req.body);
        await feature.save();
        res.status(201).json(feature);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'Feature already exists' });
        res.status(500).json({ error: err.message });
    }
});

router.put('/features/:id', protect, superAdminCheck, async (req, res) => {
    try {
        const feature = await Feature.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(feature);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/features/:id', protect, superAdminCheck, async (req, res) => {
    try {
        await Feature.findByIdAndDelete(req.params.id);
        await PricePlan.updateMany({}, { $pull: { features: { featureId: req.params.id } } });
        res.json({ message: 'Feature deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/plans', async (req, res) => {
    try {
        const plans = await PricePlan.find().populate('features.featureId').sort({ price: 1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/plans', protect, superAdminCheck, async (req, res) => {
    try {
        const plan = new PricePlan(req.body);
        await plan.save();
        res.status(201).json(await plan.populate('features.featureId'));
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'Plan already exists' });
        res.status(500).json({ error: err.message });
    }
});

router.put('/plans/:id', protect, superAdminCheck, async (req, res) => {
    try {
        const plan = await PricePlan.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('features.featureId');
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/plans/:id', protect, superAdminCheck, async (req, res) => {
    try {
        await PricePlan.findByIdAndDelete(req.params.id);
        res.json({ message: 'Plan deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Billing Config (singleton) ───
router.get('/billing-config', async (req, res) => {
    try {
        const config = await BillingConfig.getConfig();
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/billing-config', protect, superAdminCheck, async (req, res) => {
    try {
        let config = await BillingConfig.findOne();
        if (!config) config = new BillingConfig();
        const allowed = ['monthlyMultiplier', 'quarterlyMultiplier', 'yearlyMultiplier', 'monthlyLabel', 'quarterlyLabel', 'yearlyLabel'];
        allowed.forEach(key => {
            if (req.body[key] !== undefined) config[key] = req.body[key];
        });
        await config.save();
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Settings (singleton – GST%, additional charges) ───
router.get('/settings', async (req, res) => {
    try {
        const settings = await Setting.getSettings();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/settings', protect, superAdminCheck, async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) settings = new Setting();
        if (req.body.gstPercentage !== undefined) settings.gstPercentage = req.body.gstPercentage;
        if (req.body.additionalCharges !== undefined) settings.additionalCharges = req.body.additionalCharges;
        await settings.save();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Coupons CRUD ───
router.get('/coupons', protect, superAdminCheck, async (req, res) => {
    try {
        const coupons = await Coupon.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/coupons', protect, superAdminCheck, async (req, res) => {
    try {
        const coupon = new Coupon({ ...req.body, createdBy: req.user._id });
        await coupon.save();
        res.status(201).json(coupon);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'Coupon code already exists' });
        res.status(500).json({ error: err.message });
    }
});

router.put('/coupons/:id', protect, superAdminCheck, async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
        res.json(coupon);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'Coupon code already exists' });
        res.status(500).json({ error: err.message });
    }
});

router.delete('/coupons/:id', protect, superAdminCheck, async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coupon deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Validate a coupon code (any authenticated user)
router.post('/coupons/validate', protect, async (req, res) => {
    try {
        const { code, baseAmount } = req.body;
        if (!code) return res.status(400).json({ error: 'Coupon code is required' });
        const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
        if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });
        const check = coupon.isValid(baseAmount || 0);
        if (!check.valid) return res.status(400).json({ error: check.reason });
        const discount = coupon.calculateDiscount(baseAmount || 0);
        res.json({ valid: true, couponId: coupon._id, code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, discount, description: coupon.description });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Calculate price breakdown (any authenticated user)
router.post('/calculate-price', protect, async (req, res) => {
    try {
        const { baseAmount, couponCode } = req.body;
        if (!baseAmount || baseAmount <= 0) return res.status(400).json({ error: 'Valid base amount is required' });

        const settings = await Setting.getSettings();

        // GST
        const gstPercentage = settings.gstPercentage || 0;
        const gstAmount = Math.round((baseAmount * gstPercentage) / 100 * 100) / 100;

        // Additional charges
        const charges = [];
        let chargesTotal = 0;
        for (const ch of (settings.additionalCharges || [])) {
            if (!ch.isActive) continue;
            let amt = 0;
            if (ch.type === 'percentage') {
                amt = Math.round((baseAmount * ch.value) / 100 * 100) / 100;
            } else {
                amt = ch.value;
            }
            charges.push({ name: ch.name, type: ch.type, value: ch.value, amount: amt });
            chargesTotal += amt;
        }

        // Coupon discount
        let couponDiscount = 0;
        let couponInfo = null;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
            if (coupon) {
                const check = coupon.isValid(baseAmount);
                if (check.valid) {
                    couponDiscount = coupon.calculateDiscount(baseAmount);
                    couponInfo = { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue };
                }
            }
        }

        const subtotal = baseAmount + gstAmount + chargesTotal;
        const finalAmount = Math.max(0, Math.round((subtotal - couponDiscount) * 100) / 100);

        res.json({
            baseAmount,
            gstPercentage,
            gstAmount,
            additionalCharges: charges,
            chargesTotal,
            couponDiscount,
            couponInfo,
            subtotal,
            finalAmount,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;