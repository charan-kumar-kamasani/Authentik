const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

const main = async () => {
  const url = "https://www.nykaa.com/m-a-c-prep-prime-fix/p/90025";
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    });
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log("Status:", response.status());
    
    await page.screenshot({ path: 'nykaa_screenshot.png' });
    const html = await page.content();
    fs.writeFileSync('nykaa_test.html', html);
    console.log("Saved screenshot and HTML");
    
  } catch (error) {
    console.error("Error fetching Nykaa:", error.message);
  } finally {
    await browser.close();
  }
};
main();
