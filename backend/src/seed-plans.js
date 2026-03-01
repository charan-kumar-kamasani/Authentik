/**
 * Seed script — populates Features & Price Plans matching the reference pricing table.
 * Run:  node src/seed-plans.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Feature = require('./models/Feature');
const PricePlan = require('./models/PricePlan');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/authentik';

const FEATURES = [
  { name: 'Rolled over on Renewal', type: 'boolean' },
  { name: 'Free Coupon Campaign', type: 'boolean' },
  { name: 'Zero Platform Fee', type: 'boolean' },
  { name: 'Full Dashboard Access', type: 'boolean' },
  { name: 'Analytics', type: 'boolean' },
  { name: 'Counterfeit Alert', type: 'boolean' },
  { name: 'Geo Analytics', type: 'boolean' },
  { name: 'Consumer Insights', type: 'boolean' },
];

// true / false per plan per feature (same order as FEATURES above)
const PLAN_FEATURES = {
  Trial:   [false, false, true, true, true, true, true, true],
  Starter: [false, false, true, true, true, true, true, true],
  Growth:  [true,  true,  true, true, true, true, true, true],
  Scale:   [true,  true,  true, true, true, true, true, true],
  Shield:  [true,  true,  true, true, true, true, true, true],
};

const PLANS = [
  {
    name: 'Trial', pricePerQr: 0, qrCodes: '250', minQrPerOrder: '250', planValidity: '-', saveText: '-', isPopular: false, isTrial: true,
    pricing: {
      monthly:   { pricePerQr: 0, validity: '-',   saveText: '-' },
      quarterly: { pricePerQr: 0, validity: '-',   saveText: '-' },
      yearly:    { pricePerQr: 0, validity: '-',   saveText: '-' },
    }
  },
  {
    name: 'Starter', pricePerQr: 5, qrCodes: 'On-Demand', minQrPerOrder: '2,000', planValidity: '-', saveText: '-', isPopular: false, isTrial: false,
    pricing: {
      monthly:   { pricePerQr: 7,   validity: '30',  saveText: '-' },
      quarterly: { pricePerQr: 6,   validity: '90',  saveText: '2k' },
      yearly:    { pricePerQr: 5,   validity: '-',   saveText: '-' },
    }
  },
  {
    name: 'Growth', pricePerQr: 4, qrCodes: '25,000', minQrPerOrder: '1,000', planValidity: '365', saveText: '25k', isPopular: false, isTrial: false,
    pricing: {
      monthly:   { pricePerQr: 5.5, validity: '30',  saveText: '-' },
      quarterly: { pricePerQr: 4.5, validity: '90',  saveText: '10k' },
      yearly:    { pricePerQr: 4,   validity: '365', saveText: '25k' },
    }
  },
  {
    name: 'Scale', pricePerQr: 3, qrCodes: '1,00,000', minQrPerOrder: '1,000', planValidity: '365', saveText: '2L', isPopular: true, isTrial: false,
    pricing: {
      monthly:   { pricePerQr: 4.5, validity: '30',  saveText: '-' },
      quarterly: { pricePerQr: 3.5, validity: '90',  saveText: '80k' },
      yearly:    { pricePerQr: 3,   validity: '365', saveText: '2L' },
    }
  },
  {
    name: 'Shield', pricePerQr: 2, qrCodes: '2,50,000', minQrPerOrder: '1,000', planValidity: '365', saveText: '7.5L', isPopular: false, isTrial: false,
    pricing: {
      monthly:   { pricePerQr: 3.5, validity: '30',  saveText: '-' },
      quarterly: { pricePerQr: 2.5, validity: '90',  saveText: '3L' },
      yearly:    { pricePerQr: 2,   validity: '365', saveText: '7.5L' },
    }
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Clear existing data
    await Feature.deleteMany({});
    await PricePlan.deleteMany({});
    console.log('Cleared existing features & plans');

    // 2. Create features
    const createdFeatures = await Feature.insertMany(FEATURES);
    console.log(`Created ${createdFeatures.length} features`);

    // 3. Create plans with feature mappings
    for (const planData of PLANS) {
      const featureValues = PLAN_FEATURES[planData.name];
      const features = createdFeatures.map((f, i) => ({
        featureId: f._id,
        value: featureValues[i],
      }));

      await PricePlan.create({
        ...planData,
        price: planData.pricePerQr, // keep price field in sync
        features,
      });
      console.log(`  Created plan: ${planData.name}`);
    }

    console.log('\nSeeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
