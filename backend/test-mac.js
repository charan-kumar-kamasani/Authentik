const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const Product = require('./src/models/Product');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({ brand: 'mac_m1' }).lean();
  console.log("mac_m1 products count:", products.length);
  if (products.length > 0) {
    console.log("qrCode:", products[0].qrCode);
    console.log("productName:", products[0].productName);
    console.log("orderId:", products[0].orderId);
  }
  process.exit(0);
}
run();
