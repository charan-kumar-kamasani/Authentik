const { getBrowser } = require('../browserManager');
const cheerio = require('cheerio');

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getInstamartData = async (url) => {
  return new Promise(async (resolve) => {
    let result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null, siteImage: null };
    let page = null;

    try {
      const browser = await getBrowser();
      page = await browser.newPage();
      
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });
      
      let resolved = false;
      const resolveData = (data) => {
        if (resolved) return;
        resolved = true;
        if (result.price && result.mrp && result.mrp > result.price && !result.discount) {
          const diff = result.mrp - result.price;
          result.discount = Math.round((diff / result.mrp) * 100) + '%';
        }
        if (page) page.close().catch(()=>{});
        resolve(data);
      };

      page.on('response', async (response) => {
        try {
          const reqUrl = response.url();
          if (reqUrl.includes('/api/') || reqUrl.includes('graphql') || reqUrl.includes('instamart')) {
            const contentType = response.headers()['content-type'];
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              let found = false;
              
              const findData = (obj) => {
                if (!obj || typeof obj !== 'object') return;
                if (obj.price || obj.store_price) {
                   if (!result.price) result.price = cleanPrice(obj.price || obj.store_price);
                   if (!result.mrp) result.mrp = cleanPrice(obj.mrp || obj.regular_price);
                   if (!result.siteImage && obj.imageId) result.siteImage = `https://instamart-media-assets.swiggy.com/swiggy/image/upload/${obj.imageId}`;
                   found = true;
                }
                Object.values(obj).forEach(val => findData(val));
              };
              findData(data);
              
              if (found && result.price) {
                resolveData(result);
              }
            }
          }
        } catch(e) {}
      });

      await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Fallback: Check for HTML state if API intercept fails
      if (!result.price) {
          const html = await page.content();
          const $ = cheerio.load(html);
          
          const nextDataText = $('#__NEXT_DATA__').html();
          if (nextDataText) {
            try {
              const data = JSON.parse(nextDataText);
              const findData = (obj) => {
                if (!obj || typeof obj !== 'object') return;
                if (obj.price || obj.store_price) {
                   if (!result.price) result.price = cleanPrice(obj.price || obj.store_price);
                   if (!result.mrp) result.mrp = cleanPrice(obj.mrp || obj.regular_price);
                   if (!result.siteImage && obj.imageId) result.siteImage = `https://instamart-media-assets.swiggy.com/swiggy/image/upload/${obj.imageId}`;
                }
                Object.values(obj).forEach(val => findData(val));
              };
              findData(data);
            } catch (e) {}
          }
      }
      
      setTimeout(() => resolveData(result), 3000);

    } catch (err) {
      if (page) page.close().catch(()=>{});
      resolve(result.price ? result : null);
    }
  });
};

module.exports = { getInstamartData };
