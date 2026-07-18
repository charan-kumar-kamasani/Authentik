const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const testUrl = "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4";

const main = async () => {
  console.log("Opening Chrome to sniff Flipkart APIs...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Listen to all network responses
  page.on('response', async (response) => {
    const request = response.request();
    if (['xhr', 'fetch'].includes(request.resourceType())) {
      const url = response.url();
      if (url.includes('api') || url.includes('graphql') || url.includes('v1') || url.includes('pdata') || url.includes('getProduct')) {
        try {
          const json = await response.json();
          // Check if this JSON response contains our price (58900 for iPhone 15)
          const jsonString = JSON.stringify(json);
          if (jsonString.includes('58900') || jsonString.includes('price')) {
            console.log("\n========================================");
            console.log("🔥 BINGO! FOUND THE PRODUCT API 🔥");
            console.log("URL:", url);
            console.log("Method:", request.method());
            console.log("Headers:", JSON.stringify(request.headers(), null, 2));
            if (request.postData()) {
              console.log("Payload:", request.postData());
            }
            console.log("========================================\n");
          }
        } catch (err) {
          // Ignore responses that aren't JSON
        }
      }
    }
  });

  await page.goto(testUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000)); // wait extra 5s for late APIs
  
  await browser.close();
  console.log("Finished sniffing network.");
};

main();
