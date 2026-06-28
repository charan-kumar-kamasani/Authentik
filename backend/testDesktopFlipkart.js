const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const cheerio = require('cheerio');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  const url = 'https://www.flipkart.com/iqoo-neo-10-asphalt-black-256-gb/p/itm4faf25d0485ec';
  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'desktop_flipkart.png' });
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  console.log('Title:', await page.title());
  
  // Specific Desktop Selectors
  const result = {};
  result.price = parseFloat($('.Nx9bqj.CrvlNf').first().text().replace(/[^0-9]/g, '') || $('._30jeq3').first().text().replace(/[^0-9]/g, ''));
  result.mrp = parseFloat($('.yRaY8j').first().text().replace(/[^0-9]/g, '') || $('._3I9_wc').first().text().replace(/[^0-9]/g, ''));
  console.log('Result:', result);
  
  await browser.close();
})();
