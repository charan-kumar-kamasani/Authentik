const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const testUrl = "https://www.swiggy.com/instamart/item/E8TXOTD9HM";

const main = async () => {
  console.log("Opening Chrome to sniff Swiggy APIs...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  page.on('response', async (response) => {
    const request = response.request();
    if (['xhr', 'fetch'].includes(request.resourceType())) {
      const url = response.url();
      if (url.includes('api') || url.includes('graphql') || url.includes('v1') || url.includes('pdata') || url.includes('instamart/item')) {
        try {
          const json = await response.json();
          const jsonString = JSON.stringify(json);
          // Look for keywords related to the item like price or the item ID E8TXOTD9HM
          if (jsonString.includes('E8TXOTD9HM') || jsonString.includes('price')) {
            console.log("\n========================================");
            console.log("🔥 FOUND POTENTIAL SWIGGY API 🔥");
            console.log("URL:", url);
            console.log("Method:", request.method());
            if (request.postData()) {
              console.log("Payload:", request.postData());
            }
            console.log("========================================\n");
          }
        } catch (err) {
          // ignore
        }
      }
    }
  });

  await page.goto(testUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
  console.log("Finished sniffing network.");
};

main();
