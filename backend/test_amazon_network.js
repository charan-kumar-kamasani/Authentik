const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const targetPrice = '925';
  let foundInJson = false;
  let jsonApiCalls = 0;

  page.on('response', async (response) => {
    const url = response.url();
    const type = response.headers()['content-type'] || '';
    
    if (type.includes('json')) {
      jsonApiCalls++;
      try {
        const text = await response.text();
        if (text.includes(targetPrice)) {
          console.log(`[API INTERCEPTED] Found price in JSON! URL: ${url}`);
          foundInJson = true;
        }
      } catch (e) {}
    }
  });

  console.log('Opening Amazon Product Page...');
  const mainResponse = await page.goto('https://www.amazon.in/Optimum-Nutrition-Micronized-Creatine-Powder/dp/B0DBL1T67V', { waitUntil: 'networkidle2' });
  
  console.log(`Total JSON API calls made by Amazon page: ${jsonApiCalls}`);
  
  const html = await mainResponse.text();
  if (html.includes('a-price-whole') && html.includes(targetPrice)) {
    console.log('Result: The price is hardcoded directly into the raw HTML sent by the server (SSR).');
  }

  if (!foundInJson) {
    console.log('Result: NO internal JSON API contained the price.');
  }

  await browser.close();
})();
