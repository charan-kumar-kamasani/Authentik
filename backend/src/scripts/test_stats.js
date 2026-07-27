require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Scan = require('../models/Scan');
const Product = require('../models/Product');
const WarrantyClaim = require('../models/WarrantyClaim');
const Review = require('../models/Review');
const UserReward = require('../models/UserReward');
const ProductCoupon = require('../models/ProductCoupon');

async function testStats() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne({});
  const userId = user._id;

  const [
    originalScans,
    userClaims
  ] = await Promise.all([
    Scan.find({ userId, status: 'ORIGINAL' }).select('productId').lean(),
    WarrantyClaim.find({ userId, status: { $ne: 'Rejected' } }).select('productId').lean()
  ]);

  const productIds = [...new Set(originalScans.map(s => s.productId?.toString()).filter(Boolean))];
  
  const productsWithWarranty = await Product.find({
    _id: { $in: productIds },
    $or: [
      { 'warranty.duration': { $exists: true, $ne: null } },
      { 'warranty.warrantyType': { $exists: true, $ne: '' } }
    ]
  }).select('_id').lean();

  const claimedProductIds = new Set(userClaims.map(c => c.productId?.toString()));
  const pendingWarrantiesCount = productsWithWarranty.filter(p => !claimedProductIds.has(p._id.toString())).length;
  
  console.log("Pending warranties:", pendingWarrantiesCount);
  
  mongoose.connection.close();
}
testStats();
