const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const main = async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto("https://www.swiggy.com/instamart/item/E8TXOTD9HM", { waitUntil: 'networkidle2' });
  const html = await page.content();
  
  const fs = require('fs');
  fs.writeFileSync('swiggy_puppeteer.html', html);
  
  if (html.includes('__NEXT_DATA__')) console.log('Found __NEXT_DATA__');
  if (html.includes('E8TXOTD9HM')) console.log('Found Item ID in HTML');
  
  await browser.close();
};
main();
