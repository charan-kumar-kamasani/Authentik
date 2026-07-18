const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  let apiFound = false;

  page.on('response', async (response) => {
    const url = response.url();
    // Intercept the Twister API we found earlier
    if (url.includes('twisterDimensionSlotsDefault')) {
      apiFound = true;
      try {
        const text = await response.text();
        fs.writeFileSync('amazon_api_response.json', text);
        console.log(`Successfully intercepted and saved response from: ${url}`);
      } catch (e) {
        console.error('Failed to read response body');
      }
    }
  });

  console.log('Navigating to Amazon...');
  await page.goto('https://www.amazon.in/Optimum-Nutrition-Micronized-Creatine-Powder/dp/B0DBL1T67V', { waitUntil: 'networkidle2' });
  
  await browser.close();
  
  if (!apiFound) {
    console.log('Did not find the API call during load.');
  }
})();
