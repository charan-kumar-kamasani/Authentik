const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const Product = require('./src/models/Product');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const qrCode = "SA-0000000003001-VEF3";
  const product = await Product.findOne({ qrCode }).lean();
  console.log("productName on Product:", product.productName);
  process.exit(0);
}
run();
