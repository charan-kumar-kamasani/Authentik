const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const Product = require('./src/models/Product');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const qrCode = "mac_m1-000007-ORD-1775059974690-61-QY4U";
  const product = await Product.findOne({ qrCode }).lean();
  console.log("mac_m1 product orderLinks:", product?.orderLinks);
  process.exit(0);
}
run();
