const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const ProductTemplate = require('./src/models/ProductTemplate');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const template = await ProductTemplate.findOne({ productName: 'IQOO' }).lean();
  console.log("Template:", JSON.stringify(template.orderLinks, null, 2));
  process.exit(0);
}
run();
