const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

async function test(rawUrl) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  const url = rawUrl.split(' ')[0].trim();
  console.log("Cleaned URL:", url);

  await page.goto(url, { waitUntil: 'networkidle2' });
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);
  
  const pdpPrice = $('#pdp-product-price').attr('value') || $('#pdp-product-price').text();
  console.log("pdpPrice:", pdpPrice);
  
  const oldPrice = $('#old-price').attr('data-value') || $('#old-price').text();
  console.log("oldPrice:", oldPrice);

}

test("https://www.croma.com/croma-140-cm-55-inch-ultra-hd-qled-google-tv-5-0-with-dolby-vision-atmos/p/318567 Croma 140 cm (55 inch) Ultra HD QLED Google TV 5.0 with Dolby Vision Atmos");
