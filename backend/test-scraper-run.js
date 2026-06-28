const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const ProductTemplate = require('./src/models/ProductTemplate');
const { scrapeProductPrice } = require('./src/utils/scraper');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected. Running scraper logic for one template...");
  
  const template = await ProductTemplate.findOne({ productName: 'IQOO' });
  if (!template) {
    console.log("Template not found");
    return process.exit(0);
  }
  
  for (const link of template.orderLinks) {
    console.log(`Scraping ${link.url}`);
    const details = await scrapeProductPrice(link.url);
    console.log("Scraped details:", details);
    
    if (details && details.price) {
      link.price = details.price;
      link.mrp = details.mrp || link.mrp;
      link.discount = details.discount || link.discount;
      link.rating = details.rating || link.rating;
      link.reviewsCount = details.reviewsCount || link.reviewsCount;
      link.lastScrapedAt = new Date();
    }
  }
  
  await template.save();
  console.log("Template updated successfully.");
  process.exit(0);
}

run();
