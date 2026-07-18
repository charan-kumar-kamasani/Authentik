const cheerio = require('cheerio');

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getNykaaData = async (url) => {
  try {
    const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null, siteImage: null };

    // Fetch HTML page using Puppeteer Stealth to bypass Akamai/Cloudflare
    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());

    let state = null;
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
      
      // Try to get state directly from JS context
      state = await page.evaluate(() => window.__PRELOADED_STATE__);
      html = await page.content();
    } finally {
      await browser.close();
    }

    if (state && state.productPage && state.productPage.product) {
       const p = state.productPage.product;
       result.price = cleanPrice(p.price || p.offerPrice);
       result.mrp = cleanPrice(p.mrp);
       if (p.rating) result.rating = parseFloat(p.rating);
       if (p.ratingCount) result.reviewsCount = p.ratingCount.toString();
       if (p.imageUrl) result.siteImage = p.imageUrl;
    }

    if (!result.price) {
        // Fallback search through all state keys
        const findData = (obj) => {
          if (!obj || typeof obj !== 'object') return;
          if (!result.price && obj.offerPrice) result.price = cleanPrice(obj.offerPrice);
          if (!result.price && obj.price) result.price = cleanPrice(obj.price);
          if (!result.mrp && obj.mrp) result.mrp = cleanPrice(obj.mrp);
          if (!result.rating && obj.rating) result.rating = parseFloat(obj.rating);
          if (!result.reviewsCount && obj.ratingCount) result.reviewsCount = obj.ratingCount.toString();
          Object.values(obj).forEach(val => findData(val));
        };
        findData(state);
    }

    const $ = cheerio.load(html);
    
    // Fallback to DOM parsing
    if (!result.price) {
        const priceStr = $('.css-1jczs19').text() || $('[data-testid="price"]').text();
        if (priceStr) result.price = cleanPrice(priceStr);
    }
    
    if (!result.mrp) {
        const mrpStr = $('.css-111z9ua').text() || $('[data-testid="mrp"]').text();
        if (mrpStr) result.mrp = cleanPrice(mrpStr);
    }

    if (!result.siteImage) {
        result.siteImage = $('.css-11gn9r6').attr('src');
    }

    // Calculate discount if we have price and MRP
    if (result.price && result.mrp && result.mrp > result.price && !result.discount) {
      const diff = result.mrp - result.price;
      const pct = Math.round((diff / result.mrp) * 100);
      result.discount = pct + '%';
    }

    return result;
  } catch (err) {
    console.error('Error fetching Nykaa data:', err.message);
    return null;
  }
};

module.exports = {
  getNykaaData
};
