const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const ProductTemplate = require('./src/models/ProductTemplate');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const matchBrandId = new mongoose.Types.ObjectId('69cd4340308e647ff73a82ba');
  const template = await ProductTemplate.findOne({ 
             productName: 'IQOO',
             brandId: matchBrandId,
             status: 'active'
           }).lean();
           
  console.log("Did we find it?", !!template);
  if (template) {
    console.log("orderLinks length:", template.orderLinks ? template.orderLinks.length : 0);
  }
  process.exit(0);
}
run();
