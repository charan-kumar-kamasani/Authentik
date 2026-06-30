const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function test(url) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  await page.goto(url, { waitUntil: 'networkidle2' });
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);
  
  console.log("All .price-item--regular:");
  $('.price-item--regular').each((i, el) => {
    console.log(i, $(el).text().trim());
  });

  console.log("compare-price-div s:");
  $('.compare-price-div s').each((i, el) => {
    console.log(i, $(el).text().trim());
  });
}

test("https://www.optimumnutrition.co.in/products/gold-standard-100-whey-protein-powder-double-rich-chocolate-1118949");
