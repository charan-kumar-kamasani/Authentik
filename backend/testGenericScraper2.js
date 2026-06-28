const fs = require('fs');
const cheerio = require('cheerio');

const getUniversalData = (html) => {
  const $ = cheerio.load(html);
  const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null };

  // 1. JSON-LD Schema.org extraction
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const data = JSON.parse($(el).html());
      const checkSchema = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        
        if (obj['@type'] === 'Product' || obj['@type'] === 'http://schema.org/Product') {
          if (obj.offers && obj.offers.price && !result.price) {
            result.price = parseFloat(obj.offers.price);
          }
          if (obj.aggregateRating) {
            if (obj.aggregateRating.ratingValue && !result.rating) result.rating = parseFloat(obj.aggregateRating.ratingValue);
            if (obj.aggregateRating.reviewCount && !result.reviewsCount) result.reviewsCount = obj.aggregateRating.reviewCount;
            if (obj.aggregateRating.ratingCount && !result.reviewsCount) result.reviewsCount = obj.aggregateRating.ratingCount;
          }
        }
        Object.values(obj).forEach(val => checkSchema(val));
      };
      
      if (Array.isArray(data)) data.forEach(d => checkSchema(d));
      else checkSchema(data);
    } catch(e) {}
  });

  // 2. Aggressive Text Heuristics for Price, MRP, Discount (Prioritized over JSON-LD price if found)
  const textNodes = [];
  $('*').each((i, el) => {
    if ($(el).children().length === 0) {
      textNodes.push($(el).text().trim());
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
    if (text.includes('%') && text.toLowerCase().includes('off')) {
      discounts.push(text.replace(/[^0-9%]/g, ''));
    } else if (text.match(/^[0-9]+%$/)) {
      discounts.push(text);
    }

    // Ratings
    if (!foundRating && text.match(/^[0-5]\.[0-9]\s*(★|\*|star)/i)) {
      foundRating = parseFloat(text);
    } else if (!foundRating && text.match(/^[0-5]\.[0-9]$/)) {
      // Ignore bare floats to prevent matching random versions or sizes
    }

    // Reviews
    if (!foundReviews && text.match(/^\([0-9,]+\)$/)) {
      foundReviews = text.replace(/[^0-9]/g, '');
    } else if (!foundReviews && text.toLowerCase().includes('rating') && text.match(/[0-9,]+/)) {
      foundReviews = text.replace(/[^0-9]/g, '');
    }
  });

  // Override price/mrp if we found multiple valid prices in text
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
  
  if (foundRating && !result.rating) result.rating = foundRating;
  if (foundReviews && !result.reviewsCount) result.reviewsCount = foundReviews;

  return result;
};

const html = fs.readFileSync('flipkart_test.html', 'utf8');
console.log('Generic Extract:', getUniversalData(html));
