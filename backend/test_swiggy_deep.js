const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

const main = async () => {
  console.log("Starting deep network investigation on Swiggy...");
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const apiLogs = [];
  
  page.on('response', async (response) => {
    const request = response.request();
    if (['xhr', 'fetch'].includes(request.resourceType())) {
      const url = response.url();
      apiLogs.push(`Method: ${request.method()} | URL: ${url}`);
      
      // If it looks like an API, try to parse it to see if it has the price or item ID
      if (url.includes('api') || url.includes('graphql')) {
         try {
            const json = await response.json();
            const jsonStr = JSON.stringify(json);
            if (jsonStr.includes('E8TXOTD9HM')) {
               apiLogs.push(`>>> FOUND ITEM ID IN RESPONSE OF: ${url}`);
            }
         } catch(e) {}
      }
    }
  });

  // Step 1: Go to instamart homepage to get initial cookies/tokens
  console.log("Visiting Swiggy homepage to bypass WAF...");
  await page.goto("https://www.swiggy.com/instamart", { waitUntil: 'networkidle2' });
  
  // Step 2: Go to the actual item page
  console.log("Visiting item page...");
  await page.goto("https://www.swiggy.com/instamart/item/E8TXOTD9HM", { waitUntil: 'networkidle2' });
  
  // Wait a few seconds for lazy loaded APIs
  await new Promise(r => setTimeout(r, 5000));
  
  // Save HTML just in case
  const html = await page.content();
  fs.writeFileSync('swiggy_deep_html.html', html);
  
  if (html.includes('E8TXOTD9HM')) {
     console.log("Item ID is present in the final HTML!");
  } else {
     console.log("Item ID NOT FOUND in HTML. We probably got a Geofencing Error Page.");
  }
  
  fs.writeFileSync('swiggy_apis.log', apiLogs.join('\n'));
  console.log("Saved all network API calls to swiggy_apis.log");
  
  await browser.close();
};

main();
