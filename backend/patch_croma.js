const fs = require('fs');
const path = './src/utils/scraper.js';
let content = fs.readFileSync(path, 'utf8');

// Add getCromaPrice function
const cromaStr = `
const getCromaPrice = (html) => {
  const result = getUniversalData(html); // Fallback to universal first
  const $ = require('cheerio').load(html);
  
  const pdpPrice = $('#pdp-product-price').attr('value') || $('#pdp-product-price').text();
  if (pdpPrice) {
    const p = cleanPrice(pdpPrice);
    if (p) result.price = p;
  }
  
  const oldPrice = $('#old-price').attr('data-value') || $('#old-price').text();
  if (oldPrice) {
    const p = cleanPrice(oldPrice);
    if (p) result.mrp = p;
  }
  
  // Recalculate discount if mrp and price found
  if (result.price && result.mrp && result.mrp > result.price) {
    const diff = result.mrp - result.price;
    const pct = Math.round((diff / result.mrp) * 100);
    result.discount = pct + '%';
  }

  return result;
};
`;

if (!content.includes('const getCromaPrice')) {
  content = content.replace("const getAmazonPrice = (html) => {", cromaStr + "\nconst getAmazonPrice = (html) => {");
}

// Add routing in scrapeProductPrice
const oldRouting = `    if (lowerUrl.includes('amazon.in') || lowerUrl.includes('amzn.in')) {
      result = getAmazonPrice(html);
    } else if (lowerUrl.includes('flipkart.com')) {
      result = getFlipkartPrice(html);
    } else {
      result = getUniversalData(html);
    }`;

const newRouting = `    if (lowerUrl.includes('amazon.in') || lowerUrl.includes('amzn.in')) {
      result = getAmazonPrice(html);
    } else if (lowerUrl.includes('flipkart.com')) {
      result = getFlipkartPrice(html);
    } else if (lowerUrl.includes('croma.com')) {
      result = getCromaPrice(html);
    } else {
      result = getUniversalData(html);
    }`;

content = content.replace(oldRouting, newRouting);

fs.writeFileSync(path, content, 'utf8');
console.log("Croma scraper added!");
