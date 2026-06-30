const mongoose = require("mongoose");
const ProductTemplate = require("./src/models/ProductTemplate");
const { scrapeProductPrice, closeBrowser } = require("./src/utils/scraper");
require("dotenv").config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/authentik");
  
  const template = await ProductTemplate.findOne().sort({ createdAt: -1 });
  console.log("Testing template:", template.productName, template.orderLinks);

  for (const link of template.orderLinks) {
    if (link.url) {
      console.log("Scraping:", link.url);
      const scrapedDetails = await scrapeProductPrice(link.url);
      console.log("Scraped details:", scrapedDetails);
    }
  }

  await closeBrowser();
  process.exit(0);
}
test();
