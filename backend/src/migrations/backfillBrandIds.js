const connectDb = require('../../config/db');
const mongoose = require('mongoose');
const Brand = require('../models/Brand');
const Order = require('../models/Order');
const Product = require('../models/Product');

async function main() {
  const apply = process.argv.includes('--apply');
  console.log(`Backfill brandId migration — mode: ${apply ? 'APPLY' : 'DRY RUN'}`);

  await connectDb();

  try {
    const brands = await Brand.find({}).lean();
    const brandMap = new Map();
    for (const b of brands) {
      if (b.brandName) brandMap.set(b.brandName.trim().toLowerCase(), b._id.toString());
    }

    console.log(`Found ${brands.length} brands.`);

    // Orders
    const orderQuery = {
      $and: [
        { brand: { $exists: true, $ne: '' } },
        { $or: [{ brandId: { $exists: false } }, { brandId: null }] }
      ]
    };

    const orders = await Order.find(orderQuery).lean();
    console.log(`Orders eligible for backfill: ${orders.length}`);

    const orderUpdates = [];
    for (const o of orders) {
      const key = (o.brand || '').toString().trim().toLowerCase();
      const mapped = brandMap.get(key);
      if (mapped) {
        orderUpdates.push({ _id: o._id, brandId: mongoose.Types.ObjectId(mapped), brandName: o.brand });
      }
    }

    console.log(`Orders matched to brands: ${orderUpdates.length}`);

    // Products
    const productQuery = {
      $and: [
        { brand: { $exists: true, $ne: '' } },
        { $or: [{ brandId: { $exists: false } }, { brandId: null }] }
      ]
    };

    const products = await Product.find(productQuery).lean();
    console.log(`Products eligible for backfill: ${products.length}`);

    const productUpdates = [];
    for (const p of products) {
      const key = (p.brand || '').toString().trim().toLowerCase();
      const mapped = brandMap.get(key);
      if (mapped) {
        productUpdates.push({ _id: p._id, brandId: mongoose.Types.ObjectId(mapped), brandName: p.brand });
      }
    }

    console.log(`Products matched to brands: ${productUpdates.length}`);

    // Show samples
    if (orderUpdates.length) {
      console.log('\nSample order mappings:');
      orderUpdates.slice(0, 10).forEach(u => console.log(`  order ${u._id} -> brandId ${u.brandId} (brand: ${u.brandName})`));
    }
    if (productUpdates.length) {
      console.log('\nSample product mappings:');
      productUpdates.slice(0, 10).forEach(u => console.log(`  product ${u._id} -> brandId ${u.brandId} (brand: ${u.brandName})`));
    }

    if (!apply) {
      console.log('\nDry run complete. To apply changes re-run with: node backend/src/migrations/backfillBrandIds.js --apply');
      process.exit(0);
    }

    // Apply updates in bulk (batched)
    console.log('\nApplying updates...');
    const bulkOrderOps = orderUpdates.map(u => ({ updateOne: { filter: { _id: u._id }, update: { $set: { brandId: u.brandId } } } }));
    const bulkProductOps = productUpdates.map(u => ({ updateOne: { filter: { _id: u._id }, update: { $set: { brandId: u.brandId } } } }));

    if (bulkOrderOps.length) {
      const res = await Order.bulkWrite(bulkOrderOps);
      console.log(`Order bulkWrite result: ${JSON.stringify(res.result || res)}`);
    }
    if (bulkProductOps.length) {
      const res = await Product.bulkWrite(bulkProductOps);
      console.log(`Product bulkWrite result: ${JSON.stringify(res.result || res)}`);
    }

    console.log('Backfill applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

main();
