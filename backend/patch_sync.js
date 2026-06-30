const fs = require('fs');
const path = './src/routes/productTemplate.routes.js';
let content = fs.readFileSync(path, 'utf8');

// Replace kickoffBackgroundScrape with syncScrapeTemplate
const syncScrapeStr = `
const syncScrapeTemplate = async (templateId) => {
  try {
    const template = await ProductTemplate.findById(templateId);
    if (!template || !template.orderLinks || template.orderLinks.length === 0) return template;
    
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
      return await template.save();
    }
    return template;
  } catch (err) {
    console.error('Sync scrape failed for template', templateId, err);
    return null;
  }
};
`;

content = content.replace(/const kickoffBackgroundScrape = async[\s\S]*? \}, 0\);\n\};\n/g, syncScrapeStr + '\n');

// Update POST route
content = content.replace(
  "const savedTemplate = await template.save();\n    kickoffBackgroundScrape(savedTemplate._id);\n    res.status(201).json(savedTemplate);",
  "const savedTemplate = await template.save();\n    const finalTemplate = await syncScrapeTemplate(savedTemplate._id);\n    res.status(201).json(finalTemplate || savedTemplate);"
);

// Update PATCH route
content = content.replace(
  "const updatedTemplate = await template.save();\n    kickoffBackgroundScrape(updatedTemplate._id);\n    res.json(updatedTemplate);",
  "const updatedTemplate = await template.save();\n    const finalTemplate = await syncScrapeTemplate(updatedTemplate._id);\n    res.json(finalTemplate || updatedTemplate);"
);

fs.writeFileSync(path, content, 'utf8');
console.log("Routes sync patched!");
