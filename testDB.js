const mongoose = require('mongoose');
const Product = require('./backend/src/models/Product');
require('dotenv').config({path: './backend/.env'});

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const products = await Product.find({ orderLinks: { $exists: true, $not: { $size: 0 } } }).limit(1);
  console.log('Products with links:', products.length > 0 ? products[0].orderLinks : 'None');
  
  if (products.length > 0) {
    const { scrapeProductPrice } = require('./backend/src/utils/scraper');
    for (const link of products[0].orderLinks) {
      if (link.url) {
        console.log('Testing scrape for:', link.url);
        const price = await scrapeProductPrice(link.url);
        console.log('Result:', price);
      }
    }
  }
  
  process.exit(0);
});
