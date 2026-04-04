const cron = require('node-cron');
const ProductCoupon = require('../models/ProductCoupon');
const Company = require('../models/Company');
const { sendCouponExpiryNotification, sendCreditExpiryNotification } = require('../utils/emailService');

/**
 * Daily notification cron — runs every day at 9:00 AM IST (3:30 AM UTC)
 * 
 * 1. Coupon expiry notifications: 1, 2, 3, 5 days before expiry → email the user
 * 2. Company credit expiry: 30 days before → email company contacts
 */

const startNotificationCron = () => {
  // Run daily at 9:00 AM IST = 3:30 UTC
  cron.schedule('30 3 * * *', async () => {
    console.log('🔔 [CRON] Running daily expiry notification check...');
    
    try {
      await checkCouponExpiry();
    } catch (err) {
      console.error('[CRON] Coupon expiry check failed:', err.message);
    }

    try {
      await checkCreditExpiry();
    } catch (err) {
      console.error('[CRON] Credit expiry check failed:', err.message);
    }

    console.log('✅ [CRON] Daily notification check complete.');
  });

  console.log('📅 Notification cron scheduled: daily at 9:00 AM IST');
};

// ── Check coupon expiry ──
async function checkCouponExpiry() {
  const now = new Date();
  const alertDays = [1, 2, 3, 5];

  for (const daysLeft of alertDays) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysLeft);
    
    // Start and end of the target day
    const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

    // Find coupons expiring on this exact day
    const expiringCoupons = await ProductCoupon.find({
      expiryDate: { $gte: dayStart, $lte: dayEnd }
    })
      .populate('productId', 'productName qrCode')
      .lean();

    if (expiringCoupons.length === 0) continue;

    console.log(`[CRON] Found ${expiringCoupons.length} coupons expiring in ${daysLeft} day(s)`);

    // Group by code to avoid duplicate emails for same coupon campaign
    const campaignMap = new Map();
    for (const coupon of expiringCoupons) {
      if (!campaignMap.has(coupon.code)) {
        campaignMap.set(coupon.code, {
          code: coupon.code,
          productName: coupon.productId?.productName || 'Product',
          description: coupon.description || '',
          count: 1
        });
      } else {
        campaignMap.get(coupon.code).count++;
      }
    }

    // For each campaign, try to find the user/company and send notification
    // Since ProductCoupons don't store user emails directly, we notify at the company level
    for (const [code, data] of campaignMap) {
      // Find a coupon with a companyId to get company contacts
      const sample = expiringCoupons.find(c => c.code === code && c.companyId);
      if (!sample?.companyId) continue;

      try {
        const company = await Company.findById(sample.companyId).lean();
        if (!company) continue;

        const emails = [
          ...(company.officialEmails || []),
          ...(company.authorizerEmails || [])
        ].filter(Boolean);

        for (const email of emails) {
          await sendCouponExpiryNotification(email, data, daysLeft);
        }
      } catch (e) {
        console.warn(`[CRON] Failed to notify for coupon ${code}:`, e.message);
      }
    }
  }
}

// ── Check company credit expiry ──
async function checkCreditExpiry() {
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + 30);

  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  // Find companies with credit expiry within 30 days
  const companies = await Company.find({
    creditExpiry: { $gte: dayStart, $lte: dayEnd }
  }).lean();

  if (companies.length === 0) return;

  console.log(`[CRON] Found ${companies.length} companies with credits expiring in ~30 days`);

  for (const company of companies) {
    const emails = [
      ...(company.officialEmails || []),
      ...(company.authorizerEmails || [])
    ].filter(Boolean);

    if (emails.length > 0) {
      await sendCreditExpiryNotification(emails, company);
    }
  }
}

module.exports = { startNotificationCron };
