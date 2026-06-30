const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

async function test(url) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  await page.goto(url, { waitUntil: 'networkidle2' });
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);
  const result = { price: null, mrp: null, discount: null };

  // 1. JSON-LD
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const data = JSON.parse($(el).html());
      const checkSchema = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        if (obj['@type'] === 'Product' || obj['@type'] === 'http://schema.org/Product') {
          if (obj.offers && obj.offers.price && !result.price) {
            result.price = cleanPrice(obj.offers.price);
          }
        }
        Object.values(obj).forEach(val => checkSchema(val));
      };
      if (Array.isArray(data)) data.forEach(d => checkSchema(d));
      else checkSchema(data);
    } catch(e) {}
  });

  // 2. Find MRP in standard struck-through elements
  $('del, s, strike, span[style*="line-through"], div[style*="line-through"]').each((i, el) => {
    const txt = $(el).text().trim();
    if (txt.match(/₹|rs\.?/i)) {
      const p = cleanPrice(txt);
      if (p && !result.mrp) result.mrp = p;
    }
  });

  // 3. Fallback Price Finding
  const potentialPrices = [];
  // Look only at the first 30 elements containing a currency symbol, preferring those with 'price' in class
  $('*').each((i, el) => {
    const txt = $(el).text().trim();
    if ($(el).children().length === 0 && txt.match(/^(?:₹|rs\.?)\s*[0-9,]+(?:\.[0-9]{1,2})?$/i)) {
       potentialPrices.push(cleanPrice(txt));
    }
  });

  // If JSON-LD didn't have price, try to deduce it
  if (!result.price) {
     if (potentialPrices.length > 0) result.price = potentialPrices[0];
  }

  // If MRP wasn't found in <del>, deduce it from nearby larger prices or text containing MRP
  if (!result.mrp) {
     $('*').each((i, el) => {
       const txt = $(el).text().trim();
       if ($(el).children().length === 0 && txt.match(/mrp/i) && txt.match(/[0-9]/)) {
          const p = cleanPrice(txt);
          if (p && p >= result.price) result.mrp = p;
       }
     });
  }

  // Final fallback if MRP still missing but we found prices
  if (!result.mrp && potentialPrices.length > 0) {
      const p1 = potentialPrices[0];
      const p2 = potentialPrices[1];
      if (p1 && p2 && Math.abs(p1 - p2) > 0) {
         result.price = Math.min(p1, p2);
         result.mrp = Math.max(p1, p2);
      }
  }
  
  if (!result.mrp || result.mrp < result.price) result.mrp = result.price;

  console.log("URL:", url);
  console.log("Result:", result);
}

const urls = [
  "https://www.croma.com/croma-140-cm-55-inch-ultra-hd-qled-google-tv-5-0-with-dolby-vision-atmos/p/318567",
  "https://blinkit.com/prn/optimum-nutrition-on-gold-standard-100-whey-protein-double-rich-choco/prid/512941",
  "https://www.optimumnutrition.co.in/products/gold-standard-100-whey-protein-powder-double-rich-chocolate-1118949"
];

(async () => {
  for (const u of urls) await test(u);
  process.exit(0);
})();
