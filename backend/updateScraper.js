const fs = require('fs');
let code = fs.readFileSync('src/utils/scraper.js', 'utf8');

// Fix 1: ignore script/style tags in text heuristics, and fix discount string
const heuristicReplace = `  // 2. Aggressive Text Heuristics for Price, MRP, Discount
  const textNodes = [];
  $('*').not('script, style, noscript, svg, path').each((i, el) => {
    if ($(el).children().length === 0) {
      const txt = $(el).text().trim();
      if (txt) textNodes.push(txt);
    }
  });

  const prices = [];
  const discounts = [];
  let foundRating = null;
  let foundReviews = null;

  textNodes.forEach(text => {
    // Prices
    if ((text.startsWith('₹') || text.toLowerCase().startsWith('rs')) && text.length > 2 && text.length < 15) {
      const p = parseFloat(text.replace(/[^0-9.]/g, ''));
      if (!isNaN(p) && p > 0) prices.push(p);
    }
    
    // Discounts
    if (text.includes('%') && text.toLowerCase().includes('off') && text.length < 20) {
      discounts.push(text.replace(/[^0-9%]/g, ''));
    } else if (text.match(/^[0-9]{1,2}%$/)) {
      discounts.push(text);
    }

    // Ratings
    if (!foundRating && text.match(/^[0-5]\.[0-9]\s*(★|\\*|star)/i) && text.length < 15) {
      foundRating = parseFloat(text);
    }

    // Reviews
    if (!foundReviews && text.match(/^\\([0-9,]+\\)$/)) {
      foundReviews = text.replace(/[^0-9]/g, '');
    } else if (!foundReviews && text.toLowerCase().includes('rating') && text.match(/[0-9,]+/) && text.length < 30) {
      foundReviews = text.replace(/[^0-9]/g, '');
    }
  });

  if (prices.length >= 2) {
    const p1 = prices[0];
    const p2 = prices[1];
    result.price = Math.min(p1, p2);
    result.mrp = Math.max(p1, p2);
  } else if (prices.length === 1 && !result.price) {
    result.price = prices[0];
  }

  if (discounts.length > 0) {
    result.discount = discounts[0].includes('%') ? discounts[0] : discounts[0] + '%';
  }
`;

code = code.replace(/\/\/ 2\. Aggressive Text Heuristics[\s\S]*?result\.discount = discounts\[0\]\.includes\('%'\) \? discounts\[0\] : discounts\[0\] \+ '%';\n  }/, heuristicReplace);

// Fix 2: Amazon shouldn't use Universal Data blindly because it ruins price/mrp
const amazonReplace = `const getAmazonPrice = (html) => {
  const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null };
  const $ = cheerio.load(html);
  
  if (!result.price) {
    let priceText = $('.a-price-whole').first().text().trim() || $('#priceblock_ourprice').text().trim() || $('.a-price .a-offscreen').first().text().trim();
    if (priceText) result.price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
  }
  
  if (!result.mrp) {
    let mrpText = $('.a-text-price .a-offscreen').first().text().trim() || $('.priceBlockStrikePriceString').text().trim();
    if (mrpText) result.mrp = parseFloat(mrpText.replace(/[^0-9.]/g, ''));
  }
  
  if (!result.discount) {
    let discountText = $('.savingsPercentage').first().text().trim();
    if (discountText) result.discount = discountText.replace(/[^0-9%]/g, '');
  }
  
  if (!result.rating) {
    let ratingText = $('#acrPopover').attr('title') || $('.a-icon-star .a-icon-alt').first().text().trim();
    if (ratingText) {
      const rating = parseFloat(ratingText.split(' ')[0]);
      if (!isNaN(rating)) result.rating = rating;
    }
  }
  
  if (!result.reviewsCount) {
    let reviewsText = $('#acrCustomerReviewText').first().text().trim();
    if (reviewsText) {
      result.reviewsCount = reviewsText.split(' ')[0].replace(/[^0-9]/g, '');
    }
  }
  
  return result;
};`;

code = code.replace(/const getAmazonPrice = \(html\) => {[\s\S]*?return result;\n};/, amazonReplace);

fs.writeFileSync('src/utils/scraper.js', code);
