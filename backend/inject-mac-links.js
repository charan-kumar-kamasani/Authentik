const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const ProductTemplate = require('./src/models/ProductTemplate');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const mockOrderLinks = [
    {
      title: "Amazon",
      url: "https://www.amazon.in/Apple-MacBook-Air-13-3-inch-MQD32HN/dp/B073Q5R6VR",
      price: 84900,
      mrp: 99900,
      discount: "15% OFF",
      rating: 4.8,
      reviewsCount: 12500,
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      lastScrapedAt: new Date()
    },
    {
      title: "Flipkart",
      url: "https://www.flipkart.com/apple-macbook-air-m1-8-gb-256-gb-mac-os-big-sur-mgn63hn-a/p/itmfc54c11b3f26c",
      price: 82900,
      mrp: 99900,
      discount: "17% OFF",
      rating: 4.7,
      reviewsCount: 8400,
      logo: "https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/flipkart-plus_8d85f4.png",
      lastScrapedAt: new Date()
    }
  ];

  const result = await ProductTemplate.updateMany(
    { productName: "m1" },
    { $set: { orderLinks: mockOrderLinks } }
  );

  console.log("Injected mac_m1 template links:", result);
  process.exit(0);
}
run();
