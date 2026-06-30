const fs = require('fs');
const path = './src/routes/productTemplate.routes.js';
let content = fs.readFileSync(path, 'utf8');

// Add scraper job import at top
const importStr = "const { scrapeProductPrice } = require('../utils/scraper');";
if (!content.includes(importStr)) {
  content = content.replace("const express = require('express');", "const express = require('express');\n" + importStr);
}

// Function to kick off background scrape
const backgroundScrapeStr = `
const kickoffBackgroundScrape = async (templateId) => {
  setTimeout(async () => {
    try {
      const template = await ProductTemplate.findById(templateId);
      if (!template || !template.orderLinks || template.orderLinks.length === 0) return;
      
      let templateUpdated = false;
      let overallBestPrice = Infinity;
      
      for (const link of template.orderLinks) {
        if (link.url) {
          const scrapedDetails = await scrapeProductPrice(link.url);
          if (scrapedDetails) {
            if (scrapedDetails.price) link.price = scrapedDetails.price;
            if (scrapedDetails.mrp) link.mrp = scrapedDetails.mrp;
            if (scrapedDetails.discount) link.discount = scrapedDetails.discount;
            if (scrapedDetails.rating) link.rating = scrapedDetails.rating;
            if (scrapedDetails.reviewsCount) link.reviewsCount = scrapedDetails.reviewsCount;
            if (scrapedDetails.siteImage && !link.siteImage) link.siteImage = scrapedDetails.siteImage;
            link.lastScrapedAt = new Date();
            templateUpdated = true;
            
            if (scrapedDetails.price && scrapedDetails.price < overallBestPrice) {
              overallBestPrice = scrapedDetails.price;
            }
          }
        }
      }
      
      if (templateUpdated) {
        if (overallBestPrice !== Infinity) {
          template.price = overallBestPrice;
        }
        await template.save();
      }
    } catch (err) {
      console.error('Background scrape failed for template', templateId, err);
    }
  }, 0);
};
`;

content = content.replace("const router = express.Router();", "const router = express.Router();\n" + backgroundScrapeStr);

// In POST route, call kickoff
content = content.replace(
  "const savedTemplate = await template.save();\n    res.status(201).json(savedTemplate);",
  "const savedTemplate = await template.save();\n    kickoffBackgroundScrape(savedTemplate._id);\n    res.status(201).json(savedTemplate);"
);

// In PUT/PATCH route if it exists? Let's check where update is.
// I'll just write it manually by finding the route for PUT /:id
const putRouteMatch = content.match(/router\.put\('\/:id', protect,.*?const updatedTemplate = await template\.save\(\);/s);
if (putRouteMatch) {
  content = content.replace(
    "const updatedTemplate = await template.save();\n    res.json(updatedTemplate);",
    "const updatedTemplate = await template.save();\n    kickoffBackgroundScrape(updatedTemplate._id);\n    res.json(updatedTemplate);"
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log("Routes patched!");
