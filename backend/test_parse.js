const fs = require('fs');
const { getONPrice } = require('./src/utils/scraper');

const html = fs.readFileSync('test_scrape.html', 'utf8');

// The scraper exports scrapeProductPrice, but getONPrice is not exported directly.
// We can just copy the required logic to test it.
const cheerio = require('cheerio');
const getUniversalData = (html) => {
  const $ = cheerio.load(html);
  const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null };
  const cleanPrice = (str) => {
    if (!str) return null;
    const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
    return isNaN(num) ? null : num;
  };

  const checkSchema = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if (obj['@type'] === 'Product' || obj['@type'] === 'http://schema.org/Product') {
      if (obj.offers && obj.offers.price && !result.price) {
        result.price = cleanPrice(obj.offers.price);
      }
      if (obj.offers && obj.offers.highPrice && !result.mrp) {
        result.mrp = cleanPrice(obj.offers.highPrice);
      }
    }
    Object.values(obj).forEach(val => checkSchema(val));
  };

  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const data = JSON.parse($(el).html());
      if (Array.isArray(data)) data.forEach(d => checkSchema(d));
      else checkSchema(data);
    } catch(e) {}
  });

  return result;
};

const getONPriceTest = (html) => {
  const result = getUniversalData(html);
  const $ = cheerio.load(html);
  
  const cleanPrice = (str) => {
    if (!str) return null;
    const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
    return isNaN(num) ? null : num;
  };
  
  const salePrice = $('.selling-price-div .price-item').first().text();
  if (salePrice) {
    const p = cleanPrice(salePrice);
    if (p) result.price = p;
  }
  
  const regularPrice = $('.compare-price-div s').first().text();
  if (regularPrice) {
    const p = cleanPrice(regularPrice);
    if (p && p < 1000000) result.mrp = p;
  }
  
  const discountText = $('.sale-percentage').first().text();
  if (discountText) {
    result.discount = discountText.replace(/[^0-9%]/g, '');
  }

  return result;
};

console.log("Parsing result:", getONPriceTest(html));
