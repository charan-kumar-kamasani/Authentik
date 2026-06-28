const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const cheerio = require('cheerio');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  const url = 'https://amzn.in/d/0cdjvkF9';
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  const html = await page.content();
  const $ = cheerio.load(html);

  const ldJsons = [];
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      ldJsons.push(JSON.parse($(el).html()));
    } catch(e) {}
  });

  console.log(JSON.stringify(ldJsons, null, 2));
  await browser.close();
})();
