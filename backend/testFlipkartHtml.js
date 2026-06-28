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
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  const html = await page.content();
  
  const fs = require('fs');
  fs.writeFileSync('flipkart_test.html', html);
  
  await browser.close();
  console.log('Saved html to flipkart_test.html');
})();
