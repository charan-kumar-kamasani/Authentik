const { getPurplleData } = require('./src/utils/price_scrapers/purplleScraper');
const { getTatacliqData } = require('./src/utils/price_scrapers/tatacliqScraper');
const { getSnapdealData } = require('./src/utils/price_scrapers/snapdealScraper');
const { getPharmeasyData } = require('./src/utils/price_scrapers/pharmeasyScraper');
const { getApollo247Data } = require('./src/utils/price_scrapers/apollo247Scraper');
const { getCromaData } = require('./src/utils/price_scrapers/cromaScraper');
const { getReliancedigitalData } = require('./src/utils/price_scrapers/reliancedigitalScraper');
const { getPepperfryData } = require('./src/utils/price_scrapers/pepperfryScraper');

const urls = {
  purplle: 'https://www.purplle.com/product/good-vibes-tea-tree-face-wash',
  tatacliq: 'https://www.tatacliq.com/tata-cliq-men-white-solid-casual-shirt/p-mp0000000097',
  snapdeal: 'https://www.snapdeal.com/product/bhagat-mens-black-synthetic-leather/649774574928',
  pharmeasy: 'https://pharmeasy.in/health-care/products/volini-pain-relief-gel-tube-of-30-g-152',
  apollo: 'https://www.apollopharmacy.in/otc/vicks-vaporub-25-ml',
  croma: 'https://www.croma.com/apple-iphone-13-128gb-rom-4gb-ram-starlight-white-/p/243459',
  reliance: 'https://www.reliancedigital.in/apple-iphone-13-128-gb-starlight/p/491997699',
  pepperfry: 'https://www.pepperfry.com/product/mint-solid-wood-queen-size-bed-in-honey-oak-finish-by-woodsworth-1736796.html'
};

const runTest = async (name, func, url) => {
  console.time(name);
  try {
    const res = await func(url);
    console.timeEnd(name);
    console.log(`${name} Result:`, res);
  } catch(e) {
    console.timeEnd(name);
    console.log(`${name} Error:`, e.message);
  }
};

const main = async () => {
  console.log("=== AXIOS SCRAPERS (Native JSON Extraction) ===");
  await runTest('Tata CLiQ (Axios)', getTatacliqData, urls.tatacliq);
  await runTest('PharmEasy (Axios)', getPharmeasyData, urls.pharmeasy);
  await runTest('Reliance Digital (Axios)', getReliancedigitalData, urls.reliance);
  
  console.log("\n=== PUPPETEER SCRAPERS (Network Interception) ===");
  await runTest('Purplle (Puppeteer)', getPurplleData, urls.purplle);
  await runTest('Snapdeal (Puppeteer)', getSnapdealData, urls.snapdeal);
  await runTest('Apollo 24/7 (Puppeteer)', getApollo247Data, urls.apollo);
  await runTest('Croma (Puppeteer)', getCromaData, urls.croma);
  await runTest('Pepperfry (Puppeteer)', getPepperfryData, urls.pepperfry);
};

main();
