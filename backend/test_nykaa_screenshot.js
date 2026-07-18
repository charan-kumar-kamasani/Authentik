const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const main = async () => {
  const url = "https://www.nykaa.com/minimalist-10percent-vitamin-c-face-serum-for-brightening/p/1067208";
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log("Status:", response.status());
    
    await page.screenshot({ path: 'nykaa_screenshot.png' });
    console.log("Saved screenshot to nykaa_screenshot.png");
  } catch (error) {
    console.error("Error fetching Nykaa:", error.message);
  } finally {
    await browser.close();
  }
};
main();
