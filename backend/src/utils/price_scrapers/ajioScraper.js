const cheerio = require('cheerio');

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getAjioData = async (url) => {
  try {
    const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null, siteImage: null };

    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());

    let html = '';
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9'
      });
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      html = await page.content();
    } finally {
      await browser.close();
    }

    const $ = cheerio.load(html);

    // Ajio stores data in window.__PRELOADED_STATE__
    const stateMatch = html.match(/window\.__PRELOADED_STATE__\s*=\s*(\{.*?\});?\s*<\/script>/);
    if (stateMatch) {
      try {
        const state = JSON.parse(stateMatch[1]);
        const productDetails = state?.product?.productDetails;
        if (productDetails) {
            result.price = cleanPrice(productDetails.price?.offerPrice || productDetails.price?.value);
            result.mrp = cleanPrice(productDetails.price?.mrp);
            result.siteImage = productDetails.images && productDetails.images.length > 0 ? productDetails.images[0].url : null;
            // Ratings aren't always easily exposed on Ajio API, but we'll try to find them if available in other properties
        }
      } catch (e) {
        // Ignore parse error
      }
    }

    // Fallback JSON-LD
    if (!result.price) {
        $('script[type="application/ld+json"]').each((i, el) => {
          try {
            const data = JSON.parse($(el).html());
            const extractProduct = (d) => {
              if (d['@type'] === 'Product') {
                if (d.offers && d.offers.price) result.price = cleanPrice(d.offers.price);
                if (d.image) result.siteImage = Array.isArray(d.image) ? d.image[0] : d.image;
              }
            };
            if (Array.isArray(data)) data.forEach(extractProduct);
            else extractProduct(data);
          } catch(e){}
        });
    }

    if (result.price && result.mrp && result.mrp > result.price && !result.discount) {
      const diff = result.mrp - result.price;
      const pct = Math.round((diff / result.mrp) * 100);
      result.discount = pct + '%';
    }

    return result;
  } catch (err) {
    console.error('Error fetching Ajio data:', err.message);
    return null;
  }
};

module.exports = {
  getAjioData
};
