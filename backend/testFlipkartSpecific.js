const fs = require('fs');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  // Test desktop URL
  await page.goto('https://www.flipkart.com/iqoo-neo-10-asphalt-black-256-gb/p/itm4faf25d0485ec', { waitUntil: 'networkidle2' });
  const html = await page.content();
  const $ = cheerio.load(html);
  
  const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null };
  
  // Specific Desktop Selectors
  result.price = parseFloat($('.Nx9bqj').first().text().replace(/[^0-9]/g, '') || $('._30jeq3').first().text().replace(/[^0-9]/g, ''));
  result.mrp = parseFloat($('.yRaY8j').first().text().replace(/[^0-9]/g, '') || $('._3I9_wc').first().text().replace(/[^0-9]/g, ''));
  result.discount = $('.UkUFwK').first().text().trim() || $('._3Ay6Sb').first().text().trim();
  result.rating = parseFloat($('div.XQDdHH').first().text());
  result.reviewsCount = $('span.Wphh3N').first().text().split(' ')[0].replace(/[^0-9]/g, '');

  console.log('Desktop Selectors Result:', result);
  await browser.close();
})();
