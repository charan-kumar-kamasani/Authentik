const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getApollo247Fast = async (url) => {
  return new Promise(async (resolve, reject) => {
    let result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null, siteImage: null };

    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Block resources to load blazing fast
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });
      
      page.on('response', async (response) => {
        try {
          const reqUrl = response.url();
          if (reqUrl.includes('graphql') || reqUrl.includes('product')) {
            const contentType = response.headers()['content-type'];
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              
              let found = false;
              const findData = (obj) => {
                if (!obj || typeof obj !== 'object') return;
                if (obj.price || obj.mrp || obj.specialPrice) {
                   if (!result.price) result.price = cleanPrice(obj.specialPrice || obj.price);
                   if (!result.mrp) result.mrp = cleanPrice(obj.mrp);
                   found = true;
                }
                if (obj.image && !result.siteImage) result.siteImage = obj.image;
                Object.values(obj).forEach(val => findData(val));
              };
              findData(data);
              
              if (found) {
                // Instantly resolve the promise and close browser the moment we get the data!
                if (result.price && result.mrp && result.mrp > result.price && !result.discount) {
                  const diff = result.mrp - result.price;
                  const pct = Math.round((diff / result.mrp) * 100);
                  result.discount = pct + '%';
                }
                browser.close();
                resolve(result);
              }
            }
          }
        } catch(e) {}
      });

      await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
      // Don't wait for networkidle, just domcontentloaded
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // If we get here, it means we didn't resolve early. Wait a tiny bit just in case.
      setTimeout(() => {
          browser.close();
          resolve(result);
      }, 5000);

    } catch (err) {
      await browser.close();
      resolve(null);
    }
  });
};

const main = async () => {
  console.time('Apollo Fast');
  const res = await getApollo247Fast('https://www.apollopharmacy.in/otc/vicks-vaporub-25-ml');
  console.timeEnd('Apollo Fast');
  console.log(res);
};

main();
