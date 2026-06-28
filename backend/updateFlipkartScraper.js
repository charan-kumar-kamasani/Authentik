const fs = require('fs');
let code = fs.readFileSync('src/utils/scraper.js', 'utf8');

const flipkartLogic = `
const getFlipkartPrice = (html) => {
  const result = getUniversalData(html);
  const $ = cheerio.load(html);
  
  // Try Desktop Classes first
  let priceText = $('.Nx9bqj.CrvlNf').first().text().trim() || $('._30jeq3').first().text().trim();
  let mrpText = $('.yRaY8j').first().text().trim() || $('._3I9_wc').first().text().trim();
  let discountText = $('.UkUFwK').first().text().trim() || $('._3Ay6Sb').first().text().trim();
  let ratingText = $('div.XQDdHH').first().text().trim();
  let reviewsText = $('span.Wphh3N').first().text().trim();

  // If no desktop classes, try Mobile Web (React Native Web) classes
  if (!priceText) {
    // On mobile, the sale price is usually the first large text starting with ₹
    const potentialPrices = [];
    $('*').not('script, style, svg, noscript').each((i, el) => {
      const txt = $(el).text().trim();
      if (txt.startsWith('₹') && txt.length < 15 && $(el).children().length === 0) {
         potentialPrices.push(parseFloat(txt.replace(/[^0-9.]/g, '')));
      }
    });
    // Usually [MRP, Price] or [Price, MRP] at the top of the mobile DOM
    if (potentialPrices.length >= 2) {
       // We don't use Math.min because we don't want bank offers. We just take the first two, which are the main display prices
       const p1 = potentialPrices[0];
       const p2 = potentialPrices[1];
       result.price = Math.min(p1, p2);
       result.mrp = Math.max(p1, p2);
    } else if (potentialPrices.length === 1) {
       result.price = potentialPrices[0];
    }
  } else {
    if (priceText) result.price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    if (mrpText) result.mrp = parseFloat(mrpText.replace(/[^0-9.]/g, ''));
  }

  if (discountText) result.discount = discountText.replace(/[^0-9%]/g, '');
  if (ratingText) result.rating = parseFloat(ratingText);
  if (reviewsText) result.reviewsCount = reviewsText.split(' ')[0].replace(/[^0-9,]/g, '');

  return result;
};

const getAmazonPrice = (html) => {
`;

// Replace getAmazonPrice declaration with Flipkart + Amazon
code = code.replace(/const getAmazonPrice = \(html\) => \{/, flipkartLogic);

// Route flipkart URLs to getFlipkartPrice
const routeLogic = `    if (lowerUrl.includes('amazon.in') || lowerUrl.includes('amzn.in')) {
      result = getAmazonPrice(html);
    } else if (lowerUrl.includes('flipkart.com')) {
      result = getFlipkartPrice(html);
    } else {`;

code = code.replace(/    if \(lowerUrl\.includes\('amazon\.in'\) \|\| lowerUrl\.includes\('amzn\.in'\)\) \{\n      result = getAmazonPrice\(html\);\n    \} else \{/, routeLogic);

// Fix Universal Data to prioritize ratingCount
code = code.replace(/if \(obj\.aggregateRating\.reviewCount && !result\.reviewsCount\) result\.reviewsCount = obj\.aggregateRating\.reviewCount;\n            if \(obj\.aggregateRating\.ratingCount && !result\.reviewsCount\) result\.reviewsCount = obj\.aggregateRating\.ratingCount;/, 
`if (obj.aggregateRating.ratingCount) result.reviewsCount = obj.aggregateRating.ratingCount;
            else if (obj.aggregateRating.reviewCount && !result.reviewsCount) result.reviewsCount = obj.aggregateRating.reviewCount;`);


fs.writeFileSync('src/utils/scraper.js', code);
