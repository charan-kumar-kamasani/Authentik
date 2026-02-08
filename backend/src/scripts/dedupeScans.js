// Run this script once to remove duplicate Scan documents per user+qrCode and per user+productId.
// Usage: NODE_ENV=production node src/scripts/dedupeScans.js

require('dotenv').config();
const connectDb = require('../config/db');
const mongoose = require('mongoose');
const Scan = require('../models/Scan');

(async function main() {
  try {
    await connectDb();

    console.log('Starting dedupe for user+qrCode...');

    // Find duplicates by userId+qrCode
    const dupQr = await Scan.aggregate([
      { $group: { _id: { userId: '$userId', qrCode: '$qrCode' }, ids: { $push: '$_id' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).exec();

    for (const group of dupQr) {
      const ids = group.ids;
      // fetch docs, keep earliest createdAt
      const docs = await Scan.find({ _id: { $in: ids } }).sort({ createdAt: 1 });
      const keep = docs[0]._id;
      const remove = docs.slice(1).map(d => d._id);
      if (remove.length) {
        await Scan.deleteMany({ _id: { $in: remove } });
        console.log(`Removed ${remove.length} duplicate scans for user+qrCode: kept ${keep}`);
      }
    }

    console.log('Starting dedupe for user+productId...');

    const dupProd = await Scan.aggregate([
      { $group: { _id: { userId: '$userId', productId: '$productId' }, ids: { $push: '$_id' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 }, '_id.productId': { $ne: null } } }
    ]).exec();

    for (const group of dupProd) {
      const ids = group.ids;
      const docs = await Scan.find({ _id: { $in: ids } }).sort({ createdAt: 1 });
      const keep = docs[0]._id;
      const remove = docs.slice(1).map(d => d._id);
      if (remove.length) {
        await Scan.deleteMany({ _id: { $in: remove } });
        console.log(`Removed ${remove.length} duplicate scans for user+productId: kept ${keep}`);
      }
    }

    console.log('Dedupe complete.');
    process.exit(0);
  } catch (err) {
    console.error('Dedupe failed:', err);
    process.exit(1);
  }
})();
