const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const { protect } = require('../middleware/authMiddleware');
const Payment = require('../models/Payment');
const Setting = require('../models/Setting');
const Coupon = require('../models/Coupon');
const Company = require('../models/Company');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const PricePlan = require('../models/PricePlan');

const QR_TOPUP_PRICE = 5;

// ─── PhonePe SDK setup ───
let phonePeClient = null;
let PhonePeEnv = null;

async function getPhonePeClient() {
    if (phonePeClient) return phonePeClient;
    try {
        const pgSdk = require('pg-sdk-node');
        const { StandardCheckoutClient, Env } = pgSdk;
        PhonePeEnv = Env;

        const clientId = process.env.PHONEPE_CLIENT_ID;
        const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
        const apiVersion = parseInt(process.env.PHONEPE_API_VERSION || '1');
        const env = process.env.PHONEPE_ENV === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

        if (!clientId || !clientSecret) {
            console.warn('⚠️ PhonePe credentials not configured');
            return null;
        }

        phonePeClient = StandardCheckoutClient.getInstance(clientId, clientSecret, apiVersion, env);
        return phonePeClient;
    } catch (err) {
        console.warn('⚠️ pg-sdk-node not installed or failed to initialize:', err.message);
        return null;
    }
}

// Helper: calculate full price breakdown
async function calculateBreakdown(baseAmount, couponCode) {
    const settings = await Setting.getSettings();
    const gstPercentage = settings.gstPercentage || 0;
    const gstAmount = Math.round((baseAmount * gstPercentage) / 100 * 100) / 100;

    const charges = [];
    let chargesTotal = 0;
    for (const ch of (settings.additionalCharges || [])) {
        if (!ch.isActive) continue;
        let amt = ch.type === 'percentage'
            ? Math.round((baseAmount * ch.value) / 100 * 100) / 100
            : ch.value;
        charges.push({ name: ch.name, type: ch.type, value: ch.value, amount: amt });
        chargesTotal += amt;
    }

    let couponDiscount = 0;
    let coupon = null;
    if (couponCode) {
        coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
        if (coupon) {
            const check = coupon.isValid(baseAmount);
            if (check.valid) {
                couponDiscount = coupon.calculateDiscount(baseAmount);
            }
        }
    }

    const subtotal = baseAmount + gstAmount + chargesTotal;
    const finalAmount = Math.max(0, Math.round((subtotal - couponDiscount) * 100) / 100);

    return { gstPercentage, gstAmount, charges, chargesTotal, couponDiscount, coupon, subtotal, finalAmount };
}

// ─── Initiate Payment ───
router.post('/initiate', protect, async (req, res) => {
    try {
        const { type, planId, quantity, couponCode } = req.body;
        if (!['plan', 'topup'].includes(type)) return res.status(400).json({ message: 'Invalid payment type' });

        const user = await User.findById(req.user._id);
        if (!user || !user.companyId) return res.status(400).json({ message: 'User not linked to a company' });
        const company = await Company.findById(user.companyId);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        let baseAmount = 0;
        let plan = null;
        let topupQty = 0;

        if (type === 'plan') {
            plan = await PricePlan.findById(planId);
            if (!plan) return res.status(404).json({ message: 'Plan not found' });
            baseAmount = plan.price || 0;
        } else {
            topupQty = parseInt(quantity) || 0;
            if (topupQty <= 0) return res.status(400).json({ message: 'Invalid quantity' });
            baseAmount = topupQty * QR_TOPUP_PRICE;
        }

        const breakdown = await calculateBreakdown(baseAmount, couponCode);
        const merchantOrderId = 'ORD_' + randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase();

        // Save payment record
        const payment = await Payment.create({
            companyId: company._id,
            type,
            planId: plan ? plan._id : null,
            quantity: topupQty,
            baseAmount,
            gstPercentage: breakdown.gstPercentage,
            gstAmount: breakdown.gstAmount,
            additionalCharges: breakdown.charges,
            couponCode: couponCode ? couponCode.toUpperCase().trim() : null,
            couponDiscount: breakdown.couponDiscount,
            finalAmount: breakdown.finalAmount,
            merchantOrderId,
            status: 'pending',
            performedBy: user._id,
        });

        // Try PhonePe
        const client = await getPhonePeClient();
        if (client && breakdown.finalAmount > 0) {
            try {
                const amountInPaise = Math.round(breakdown.finalAmount * 100);
                const callbackUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/payments/callback`;
                const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5175'}/admin/billing?payment=${merchantOrderId}`;

                const request = pgSdkRequest(merchantOrderId, amountInPaise, callbackUrl, redirectUrl);
                console.log('🔵 PhonePe request:', { merchantOrderId, amountInPaise, callbackUrl, redirectUrl });
                const response = await client.pay(request);
                console.log('✅ PhonePe response:', JSON.stringify(response).slice(0, 500));

                payment.redirectUrl = response.redirectUrl || response.data?.redirectUrl || null;
                await payment.save();

                return res.json({
                    paymentId: payment._id,
                    merchantOrderId,
                    redirectUrl: payment.redirectUrl,
                    finalAmount: breakdown.finalAmount,
                    breakdown: {
                        baseAmount,
                        gstPercentage: breakdown.gstPercentage,
                        gstAmount: breakdown.gstAmount,
                        additionalCharges: breakdown.charges,
                        couponDiscount: breakdown.couponDiscount,
                        finalAmount: breakdown.finalAmount,
                    },
                });
            } catch (phonePeErr) {
                console.error('❌ PhonePe pay error:', phonePeErr.message);
                console.error('❌ PhonePe error details:', { 
                    type: phonePeErr.type, 
                    code: phonePeErr.code, 
                    httpStatusCode: phonePeErr.httpStatusCode,
                    data: phonePeErr.data 
                });
                // Mark payment as failed and do NOT auto-complete or add credits
                payment.status = 'failed';
                payment.phonePeError = phonePeErr.message;
                try { await payment.save({ validateModifiedOnly: true }); } catch (e) { console.warn('Failed to save failed payment:', e.message); }
                return res.status(502).json({ message: 'Payment gateway error', detail: phonePeErr.message });
            }
        }

        // If PhonePe not configured or amount is 0, auto-complete
        payment.status = 'completed';
        await payment.save();

        // Add credits immediately (no real payment gateway)
        const creditsResult = await addCreditsFromPayment(payment, company, user);

        res.json({
            paymentId: payment._id,
            merchantOrderId,
            redirectUrl: null,
            autoCompleted: true,
            finalAmount: breakdown.finalAmount,
            breakdown: {
                baseAmount,
                gstPercentage: breakdown.gstPercentage,
                gstAmount: breakdown.gstAmount,
                additionalCharges: breakdown.charges,
                couponDiscount: breakdown.couponDiscount,
                finalAmount: breakdown.finalAmount,
            },
            ...creditsResult,
        });
    } catch (error) {
        console.error('Payment initiate error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Helper to build PhonePe payment request
function pgSdkRequest(merchantOrderId, amountInPaise, callbackUrl, redirectUrl) {
    try {
        const pgSdk = require('pg-sdk-node');
        const { StandardCheckoutPayRequest } = pgSdk;
        const request = StandardCheckoutPayRequest.builder()
            .merchantOrderId(merchantOrderId)
            .amount(amountInPaise)
            .callbackUrl(callbackUrl)
            .redirectUrl(redirectUrl)
            .build();
        return request;
    } catch {
        return { merchantOrderId, amount: amountInPaise, callbackUrl, redirectUrl };
    }
}

// Helper: add credits from a completed payment
async function addCreditsFromPayment(payment, company, user) {
    let creditsToAdd = 0;

    if (payment.type === 'plan' && payment.planId) {
        const plan = await PricePlan.findById(payment.planId);
        if (plan && plan.qrCodes) {
            const parsed = parseInt(String(plan.qrCodes).replace(/[^\d]/g, ''), 10);
            creditsToAdd = isNaN(parsed) ? 0 : parsed;
        }
    } else if (payment.type === 'topup') {
        creditsToAdd = payment.quantity || 0;
    }

    if (creditsToAdd <= 0) return { creditsAdded: 0 };

    const newBalance = (company.qrCredits || 0) + creditsToAdd;
    company.qrCredits = newBalance;
    await company.save({ validateModifiedOnly: true });

    const txn = await CreditTransaction.create({
        companyId: company._id,
        type: payment.type === 'plan' ? 'purchase_plan' : 'purchase_topup',
        amount: creditsToAdd,
        balanceAfter: newBalance,
        unitPrice: payment.type === 'topup' ? QR_TOPUP_PRICE : (payment.planId ? (payment.baseAmount / creditsToAdd) : 0),
        totalPaid: payment.finalAmount,
        planName: payment.type === 'plan' && payment.planId ? (await PricePlan.findById(payment.planId))?.name : null,
        performedBy: user._id,
        note: `Payment ${payment.merchantOrderId} — ₹${payment.finalAmount}`,
    });

    payment.creditTransactionId = txn._id;
    await payment.save();

    // Increment coupon usage
    if (payment.couponCode && payment.couponDiscount > 0) {
        await Coupon.findOneAndUpdate({ code: payment.couponCode }, { $inc: { usedCount: 1 } });
    }

    return { creditsAdded: creditsToAdd, qrCredits: newBalance };
}

// ─── PhonePe S2S Callback / Webhook ───
// PhonePe sends a POST with base64-encoded response in the body.
// This is the server-to-server notification — no auth token needed.
router.post('/callback', async (req, res) => {
    try {
        console.log('📥 PhonePe callback received:', JSON.stringify(req.body).slice(0, 500));

        let merchantOrderId = null;
        let transactionId = null;
        let paymentState = null;

        // ── Method 1: PhonePe SDK verification (pg-sdk-node) ──
        const client = await getPhonePeClient();
        if (client && req.body.response) {
            try {
                // pg-sdk-node provides handleCallback or verifyResponse
                const decoded = Buffer.from(req.body.response, 'base64').toString('utf-8');
                const callbackData = JSON.parse(decoded);
                console.log('📦 PhonePe decoded callback:', JSON.stringify(callbackData).slice(0, 500));

                // PhonePe Standard Checkout callback structure
                const data = callbackData.data || callbackData;
                merchantOrderId = data.merchantOrderId || data.merchantTransactionId;
                transactionId = data.transactionId || data.phonePeTransactionId || data.providerReferenceId;
                paymentState = data.state || data.status || callbackData.code;

                // Normalize state
                if (paymentState === 'PAYMENT_SUCCESS' || paymentState === 'SUCCESS' || paymentState === 'COMPLETED') {
                    paymentState = 'COMPLETED';
                } else if (paymentState === 'PAYMENT_ERROR' || paymentState === 'FAILED' || paymentState === 'PAYMENT_DECLINED') {
                    paymentState = 'FAILED';
                } else if (paymentState === 'PAYMENT_PENDING') {
                    paymentState = 'PENDING';
                }
            } catch (decodeErr) {
                console.error('PhonePe callback decode error:', decodeErr.message);
            }
        }

        // ── Method 2: Direct fields (fallback / testing) ──
        if (!merchantOrderId) {
            merchantOrderId = req.body.merchantOrderId || req.body.merchantTransactionId;
            transactionId = req.body.transactionId || req.body.providerReferenceId;
            paymentState = req.body.status || req.body.state || req.body.code;
        }

        if (!merchantOrderId) {
            console.warn('⚠️ PhonePe callback: No merchantOrderId found');
            return res.status(400).json({ message: 'Missing merchantOrderId' });
        }

        const payment = await Payment.findOne({ merchantOrderId });
        if (!payment) {
            console.warn('⚠️ PhonePe callback: Payment not found for', merchantOrderId);
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Already processed — skip duplicate callbacks
        if (payment.status !== 'pending') {
            console.log('ℹ️ Payment already processed:', merchantOrderId, payment.status);
            return res.json({ message: 'Payment already processed', status: payment.status });
        }

        if (paymentState === 'COMPLETED') {
            payment.status = 'completed';
            payment.phonePeTransactionId = transactionId || null;
            await payment.save();

            // Add credits
            const company = await Company.findById(payment.companyId);
            const user = await User.findById(payment.performedBy);
            if (company && user) {
                const result = await addCreditsFromPayment(payment, company, user);
                console.log('✅ Credits added via webhook:', merchantOrderId, result);
            }
        } else if (paymentState === 'FAILED') {
            payment.status = 'failed';
            payment.phonePeTransactionId = transactionId || null;
            await payment.save();
            console.log('❌ Payment failed via webhook:', merchantOrderId);
        } else {
            // Still pending or unknown — do nothing, let status polling handle it
            console.log('⏳ Payment still pending via webhook:', merchantOrderId, paymentState);
        }

        // PhonePe expects a 200 response
        res.json({ message: 'Callback processed', status: payment.status });
    } catch (error) {
        console.error('Payment callback error:', error);
        // Still return 200 to PhonePe to avoid retries on our server error
        res.status(200).json({ message: 'Callback received with error' });
    }
});

// ─── PhonePe Webhook (alternate endpoint for redundancy) ───
// Register this URL in PhonePe dashboard: {BACKEND_URL}/payments/webhook
router.post('/webhook', async (req, res) => {
    try {
        console.log('🔔 PhonePe webhook received:', JSON.stringify(req.body).slice(0, 500));

        let merchantOrderId = null;
        let transactionId = null;
        let paymentState = null;

        // Decode base64 response from PhonePe
        if (req.body.response) {
            try {
                const decoded = Buffer.from(req.body.response, 'base64').toString('utf-8');
                const callbackData = JSON.parse(decoded);
                const data = callbackData.data || callbackData;
                merchantOrderId = data.merchantOrderId || data.merchantTransactionId;
                transactionId = data.transactionId || data.providerReferenceId;
                paymentState = data.state || data.status || callbackData.code;
            } catch (decodeErr) {
                console.error('Webhook decode error:', decodeErr.message);
            }
        }

        if (!merchantOrderId) {
            merchantOrderId = req.body.merchantOrderId || req.body.merchantTransactionId;
            transactionId = req.body.transactionId || req.body.providerReferenceId;
            paymentState = req.body.status || req.body.state;
        }

        if (!merchantOrderId) {
            return res.status(200).json({ message: 'No order ID' });
        }

        // Normalize
        if (['PAYMENT_SUCCESS', 'SUCCESS', 'COMPLETED'].includes(paymentState)) paymentState = 'COMPLETED';
        else if (['PAYMENT_ERROR', 'FAILED', 'PAYMENT_DECLINED'].includes(paymentState)) paymentState = 'FAILED';

        const payment = await Payment.findOne({ merchantOrderId });
        if (!payment || payment.status !== 'pending') {
            return res.status(200).json({ message: 'Already processed or not found' });
        }

        if (paymentState === 'COMPLETED') {
            payment.status = 'completed';
            payment.phonePeTransactionId = transactionId || null;
            await payment.save();

            const company = await Company.findById(payment.companyId);
            const user = await User.findById(payment.performedBy);
            if (company && user) {
                await addCreditsFromPayment(payment, company, user);
                console.log('✅ Credits added via webhook:', merchantOrderId);
            }
        } else if (paymentState === 'FAILED') {
            payment.status = 'failed';
            payment.phonePeTransactionId = transactionId || null;
            await payment.save();
        }

        res.status(200).json({ message: 'Webhook processed', status: payment.status });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(200).json({ message: 'Webhook received' });
    }
});

// ─── Check Payment Status ───
router.get('/status/:merchantOrderId', protect, async (req, res) => {
    try {
        const payment = await Payment.findOne({ merchantOrderId: req.params.merchantOrderId })
            .populate('planId', 'name price qrCodes')
            .populate('companyId', 'companyName qrCredits');

        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        // Optionally check with PhonePe SDK for real-time status
        if (payment.status === 'pending') {
            const client = await getPhonePeClient();
            if (client) {
                try {
                    const statusResp = await client.getOrderStatus(req.params.merchantOrderId);
                    if (statusResp && (statusResp.state === 'COMPLETED' || statusResp.state === 'SUCCESS')) {
                        payment.status = 'completed';
                        payment.phonePeTransactionId = statusResp.transactionId || null;
                        await payment.save();

                        const company = await Company.findById(payment.companyId);
                        const user = await User.findById(payment.performedBy);
                        if (company && user) {
                            await addCreditsFromPayment(payment, company, user);
                        }
                    } else if (statusResp && statusResp.state === 'FAILED') {
                        payment.status = 'failed';
                        await payment.save();
                    }
                } catch (statusErr) {
                    console.warn('PhonePe status check failed:', statusErr.message);
                }
            }
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ─── Payment History ───
router.get('/history', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        let query = {};
        if (['superadmin', 'admin'].includes(user.role)) {
            if (req.query.companyId) query.companyId = req.query.companyId;
        } else {
            if (!user.companyId) return res.status(400).json({ message: 'User not linked to a company' });
            query.companyId = user.companyId;
        }
        const payments = await Payment.find(query)
            .populate('planId', 'name price qrCodes')
            .populate('companyId', 'companyName')
            .populate('performedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(req.query.limit) || 100);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
