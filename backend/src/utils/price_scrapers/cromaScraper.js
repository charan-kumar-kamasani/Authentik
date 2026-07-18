const { getBrowser } = require('../browserManager');

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getCromaData = async (url) => {
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
          if (reqUrl.includes('/occ/v2') || reqUrl.includes('product') || reqUrl.includes('graphql')) {
            const contentType = response.headers()['content-type'];
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              let found = false;
              
              const findData = (obj) => {
                if (!obj || typeof obj !== 'object') return;
                if (obj.price || obj.mrp) {
                   if (!result.price) result.price = cleanPrice(obj.price?.value || obj.price);
                   if (!result.mrp) result.mrp = cleanPrice(obj.mrp?.value || obj.mrp);
                   found = true;
                }
                if (obj.images && Array.isArray(obj.images) && obj.images.length > 0 && !result.siteImage) {
                   result.siteImage = obj.images[0].url;
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
      
      setTimeout(() => resolveData(result), 3000);

    } catch (err) {
      if (page) page.close().catch(()=>{});
      resolve(result.price ? result : null);
    }
  });
};

module.exports = { getCromaData };
