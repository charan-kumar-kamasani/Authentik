const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

const main = async () => {
  const url = "https://www.meesho.com/trendy-attractive-cotton-blend-women-tshirts/p/3547";
  
  console.log("Fetching Meesho URL with Puppeteer:", url);
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
    fs.writeFileSync('meesho_test.html', html);
    console.log("Saved Meesho HTML to meesho_test.html");
    
    if (html.includes('__NEXT_DATA__')) {
      console.log('Found __NEXT_DATA__');
    }
  } catch (error) {
    console.error("Error fetching Meesho:", error.message);
  } finally {
    await browser.close();
  }
};

main();
