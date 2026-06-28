const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  const url = 'https://dl.flipkart.com/dl/iqoo-neo-10-asphalt-black-256-gb/p/itm4faf25d0485ec?pid=MOBHN64JA8WE4QQC';
  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: '/Users/charankumarkamasani/.gemini/antigravity-ide/brain/0198a839-9b92-4da3-b6ac-fd089805ac07/flipkart_test.png' });
  
  const content = await page.content();
  console.log('Page title:', await page.title());
  
  await browser.close();
  console.log('Saved screenshot to flipkart_test.png');
})();
