const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
require('./src/models/Order');
const Product = require('./src/models/Product');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const qrCode = "SA-0000000003002-RG6C";
  const product = await Product.findOne({ qrCode }).populate('orderId').lean();
  console.log("productName on Product:", product.productName);
  console.log("productName on Order:", product.orderId?.productName);
  process.exit(0);
}
run();
