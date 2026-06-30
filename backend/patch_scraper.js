const fs = require('fs');
const path = './src/utils/scraper.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add cleanPrice utility at the top
const cleanPriceStr = `
const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};
`;
content = content.replace("const getUniversalData = (html) => {", cleanPriceStr + "\nconst getUniversalData = (html) => {");

// 2. Fix JSON-LD parsing
content = content.replace(
  "result.price = parseFloat(obj.offers.price);", 
  "result.price = cleanPrice(obj.offers.price);"
);

// 3. Fix getUniversalData price extraction
content = content.replace(
  "const p = parseFloat(m[1].replace(/,/g, ''));",
  "const p = cleanPrice(m[1]);"
);

// 4. Fix getFlipkartPrice
content = content.replace(
  "potentialPrices.push(parseFloat(txt.replace(/[^0-9.]/g, '')));",
  "potentialPrices.push(cleanPrice(txt));"
);
content = content.replace(
  "result.mrp = parseFloat(mobileMrpText.replace(/[^0-9.]/g, ''));",
  "result.mrp = cleanPrice(mobileMrpText);"
);
content = content.replace(
  "if (priceText) result.price = parseFloat(priceText.replace(/[^0-9.]/g, ''));",
  "if (priceText) result.price = cleanPrice(priceText);"
);
content = content.replace(
  "if (mrpText) result.mrp = parseFloat(mrpText.replace(/[^0-9.]/g, ''));",
  "if (mrpText) result.mrp = cleanPrice(mrpText);"
);

// 5. Fix getAmazonPrice
content = content.replace(
  "if (priceText) result.price = parseFloat(priceText.replace(/[^0-9.]/g, ''));",
  "if (priceText) result.price = cleanPrice(priceText);"
);
content = content.replace(
  "if (mrpText) result.mrp = parseFloat(mrpText.replace(/[^0-9.]/g, ''));",
  "if (mrpText) result.mrp = cleanPrice(mrpText);"
);

// 6. Fix Logo Scraping inside scrapeProductPrice
const logoScrapingOld = `    const lowerUrl = url.toLowerCase();
    let result = null;
    
    if (lowerUrl.includes('amazon.in') || lowerUrl.includes('amzn.in')) {
      result = getAmazonPrice(html);
    } else if (lowerUrl.includes('flipkart.com')) {
      result = getFlipkartPrice(html);
    } else {
      // Use Universal Scraper for Flipkart, Myntra, Meesho, Nykaa, etc.
      result = getUniversalData(html);
    }
    
    if (result && result.price) {
      try {
        const urlObj = new URL(url);
        result.siteImage = \`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=\${urlObj.origin}&size=64\`;
      } catch(e) {}
      return result;
    }
    return null;`;

const logoScrapingNew = `    const lowerUrl = url.toLowerCase();
    let result = null;
    
    if (lowerUrl.includes('amazon.in') || lowerUrl.includes('amzn.in')) {
      result = getAmazonPrice(html);
    } else if (lowerUrl.includes('flipkart.com')) {
      result = getFlipkartPrice(html);
    } else {
      result = getUniversalData(html);
    }
    
    if (result) {
      try {
        const cheerio = require('cheerio');
        const $ = cheerio.load(html);
        let siteImage = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || $('meta[property="og:image"]').attr('content');
        const urlObj = new URL(url);
        
        if (siteImage) {
          result.siteImage = new URL(siteImage, url).href;
        } else {
          result.siteImage = \`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=\${urlObj.origin}&size=128\`;
        }
      } catch(e) {}
      
      // We return the result even if price is missing so we can at least save the logo/rating if found
      return result;
    }
    return null;`;

content = content.replace(logoScrapingOld, logoScrapingNew);

fs.writeFileSync(path, content, 'utf8');
console.log("Scraper patched!");
