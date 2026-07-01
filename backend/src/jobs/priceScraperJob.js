const cron = require('node-cron');
const ProductTemplate = require('../models/ProductTemplate');
const { scrapeProductPrice, closeBrowser } = require('../utils/scraper');

const runScraper = async () => {
  console.log('[PriceScraper] Starting background price scraping job...');
  try {
    const templates = await ProductTemplate.find({ 
      status: 'active', 
      orderLinks: { $exists: true, $not: { $size: 0 } } 
    });
    
    console.log(`[PriceScraper] Found ${templates.length} active ProductTemplates with orderLinks`);

    let updatedCount = 0;

    for (const template of templates) {
      console.log(`[PriceScraper] Processing product template '${template.productName}' with ${template.orderLinks.length} links`);
      let templateUpdated = false;
      let overallBestPrice = Infinity;

      for (const link of template.orderLinks) {
        if (link.url) {
          console.log(`[PriceScraper] - Attempting to scrape URL: ${link.url}`);
          const scrapedDetails = await scrapeProductPrice(link.url);
          console.log(`[PriceScraper] - Scrape result:`, scrapedDetails);
          
          if (scrapedDetails && scrapedDetails.price) {
            link.price = scrapedDetails.price;
            link.mrp = scrapedDetails.mrp || link.mrp;
            link.discount = scrapedDetails.discount || link.discount;
            link.rating = scrapedDetails.rating || link.rating;
            link.reviewsCount = scrapedDetails.reviewsCount || link.reviewsCount;
            link.lastScrapedAt = new Date();
            templateUpdated = true;
            
            if (scrapedDetails.price < overallBestPrice) {
              overallBestPrice = scrapedDetails.price;
            }
          }
          
          // Random delay between 2-4 seconds
          await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
        }
      }

      if (templateUpdated) {
        if (overallBestPrice !== Infinity) {
          template.price = overallBestPrice;
        }
        await template.save();
        updatedCount++;
        console.log(`[PriceScraper] Updated template '${template.productName}' with scraped links`);
      }
      
      // Delay between templates
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log(`[PriceScraper] Job completed. Updated a total of ${updatedCount} ProductTemplates.`);
  } catch (err) {
    console.error('[PriceScraper] Job failed:', err);
  } finally {
    // ALWAYS close the browser to free memory
    await closeBrowser();
  }
};

const startPriceScraperJob = () => {
  // Run every day at midnight (12:00 AM)
  cron.schedule('0 0 * * *', runScraper);
};

module.exports = { startPriceScraperJob, runScraper };
