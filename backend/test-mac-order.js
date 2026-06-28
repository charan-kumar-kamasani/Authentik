const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const Order = require('./src/models/Order');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const orderId = "69cd4406308e647ff73a8342";
  const order = await Order.findById(orderId).lean();
  console.log("Order links:", order?.orderLinks);
  process.exit(0);
}
run();
