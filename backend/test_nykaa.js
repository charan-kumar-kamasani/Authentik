const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

const main = async () => {
  const url = "https://www.nykaa.com/minimalist-10percent-vitamin-c-face-serum-for-brightening/p/1067208";
  
  console.log("Fetching Nykaa URL with Puppeteer:", url);
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log("Status:", response.status());
    
    const html = await page.content();
    fs.writeFileSync('nykaa_test.html', html);
    console.log("Saved Nykaa HTML to nykaa_test.html");
    
    if (html.includes('window.__PRELOADED_STATE__')) {
      console.log('Found window.__PRELOADED_STATE__');
    }
    if (html.includes('__NEXT_DATA__')) {
      console.log('Found __NEXT_DATA__');
    }
    if (html.includes('application/ld+json')) {
      console.log('Found application/ld+json');
    }
  } catch (error) {
    console.error("Error fetching Nykaa:", error.message);
  } finally {
    await browser.close();
  }
};

main();
