const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Scan",
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: null, // FAKE products won’t have this
      },

      brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        default: null,
      },

      brand: String, // String name of the brand

      qrCode: { type: String, required: true },

      productName: String,
      expiryDate: String,

      status: {
        type: String,
        enum: ["ORIGINAL", "FAKE", "ALREADY_USED", "INACTIVE"],
        required: true,
      },

      place: String,
      latitude: Number,
      longitude: Number,
    },
    { timestamps: true }
  )
);

// Ensure a user cannot create duplicate scans for the same QR/product.
// These are sparse unique indexes so existing null productId entries won't conflict.
module.exports.schema = module.exports.schema || null;

// Add compound indexes (created when Mongoose connects). Note:
// - If your DB already has duplicate documents these index creations will fail; clean duplicates first or create the indexes manually.
// - Using sparse avoids conflicts where productId is null for FAKE scans.
module.exports.collection && module.exports.collection.createIndex && (async () => {
  try {
    // We want to record every scan in history, so we don't use unique indexes for userId + qrCode anymore.
    // However, we still want to index them for fast lookups.
    try { await module.exports.collection.dropIndex('userId_1_qrCode_1'); } catch (_) {}
    try { await module.exports.collection.dropIndex('userId_1_productId_1'); } catch (_) {}
    
    await module.exports.collection.createIndex({ userId: 1, qrCode: 1 });
    await module.exports.collection.createIndex({ userId: 1, productId: 1 });
    await module.exports.collection.createIndex({ brandId: 1, status: 1 }); // Useful for company dashboard
    // Prevent multiple ORIGINAL scans for the same product (enforced only for status === 'ORIGINAL')
    // Drop old index with unsupported $ne expression if it exists
    try { await module.exports.collection.dropIndex('productId_1_status_1'); } catch (_) { /* may not exist */ }
    await module.exports.collection.createIndex(
      { productId: 1, status: 1 },
      { unique: true, partialFilterExpression: { status: 'ORIGINAL', productId: { $type: 'objectId' } } }
    );
  } catch (err) {
    // Index creation may fail if duplicates exist; log and continue
    console.warn('Scan model index creation warning:', err.message || err);
  }
})();
