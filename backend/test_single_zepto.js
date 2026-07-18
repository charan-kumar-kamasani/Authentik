require('dotenv').config();
const { scrapeProductPrice } = require('./src/utils/scraper');

const main = async () => {
  const testUrl = "https://www.zepto.com/pn/optimum-nutrition-on-multivitamin-for-men-60-tablets-26-vitamins-minerals-amino-acids/pvid/137a9c2c-9bc0-400e-b265-bc40be866394";
  console.log(`Fetching data for: ${testUrl}`);
  
  try {
    const data = await scrapeProductPrice(testUrl);
    console.log("Scrape Result:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
