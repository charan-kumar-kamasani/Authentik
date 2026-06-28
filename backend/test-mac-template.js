const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const ProductTemplate = require('./src/models/ProductTemplate');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const template = await ProductTemplate.findOne({ productName: 'm1' }).lean();
  console.log("mac_m1 template orderLinks:", template?.orderLinks);
  process.exit(0);
}
run();
