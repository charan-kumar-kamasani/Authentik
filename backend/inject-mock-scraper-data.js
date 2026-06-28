const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const ProductTemplate = require('./src/models/ProductTemplate');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const template = await ProductTemplate.findOne({ productName: 'IQOO' });
  if (!template) {
    console.log("Template not found");
    return process.exit(0);
  }
  
  for (const link of template.orderLinks) {
    if (link.title.toLowerCase().includes('amazon')) {
      link.price = 14529;
      link.mrp = 14999;
      link.discount = "15";
      link.rating = 4.6;
      link.reviewsCount = "8,432";
    } else if (link.title.toLowerCase().includes('flipkart')) {
      link.price = 14699;
      link.mrp = 14999;
      link.discount = "10";
      link.rating = 4.4;
      link.reviewsCount = "4,192";
    }
    link.lastScrapedAt = new Date();
  }
  
  await template.save();
  console.log("Mock data injected successfully.");
  process.exit(0);
}

run();
