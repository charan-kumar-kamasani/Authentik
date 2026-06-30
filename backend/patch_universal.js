const fs = require('fs');
const path = './src/utils/scraper.js';
let content = fs.readFileSync(path, 'utf8');

const universalStr = `
const getUniversalData = (html) => {
  const $ = cheerio.load(html);
  const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null };

  const checkSchema = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if (obj['@type'] === 'Product' || obj['@type'] === 'http://schema.org/Product') {
      if (obj.offers && obj.offers.price && !result.price) {
        result.price = cleanPrice(obj.offers.price);
      }
      if (obj.offers && obj.offers.highPrice && !result.mrp) {
        result.mrp = cleanPrice(obj.offers.highPrice);
      }
      if (obj.aggregateRating) {
        if (obj.aggregateRating.ratingValue && !result.rating) result.rating = parseFloat(obj.aggregateRating.ratingValue);
        if (obj.aggregateRating.ratingCount) result.reviewsCount = obj.aggregateRating.ratingCount;
        else if (obj.aggregateRating.reviewCount && !result.reviewsCount) result.reviewsCount = obj.aggregateRating.reviewCount;
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

  // Extract from meta tags (OpenGraph, etc)
  if (!result.price) {
    const metaPrice = $('meta[property="product:price:amount"], meta[name="twitter:data1"], meta[itemprop="price"]').first().attr('content');
    if (metaPrice) result.price = cleanPrice(metaPrice);
  }

  // DOM Heuristics for MRP (usually struck through)
  $('del, s, strike, span[style*="line-through"], div[style*="line-through"]').each((i, el) => {
    const txt = $(el).text().trim();
    if (txt.match(/₹|rs\.?/i)) {
      const p = cleanPrice(txt);
      if (p && p < 1000000 && (!result.mrp || p > result.mrp)) result.mrp = p;
    }
  });

  // Fallback for price and MRP if JSON-LD/meta failed
  const potentialPrices = [];
  $('*').not('script, style, noscript, svg, path').each((i, el) => {
    const txt = $(el).text().trim();
    if ($(el).children().length === 0 && txt.match(/^(?:₹|rs\.?)\s*[0-9,]+(?:\.[0-9]{1,2})?$/i)) {
       const p = cleanPrice(txt);
       if (p && p < 1000000) potentialPrices.push(p);
    }
  });

  if (!result.price && potentialPrices.length > 0) {
     result.price = potentialPrices[0];
  }

  if (!result.mrp) {
     $('*').not('script, style, noscript, svg, path').each((i, el) => {
       const txt = $(el).text().trim().toLowerCase();
       if ($(el).children().length === 0 && txt.includes('mrp') && txt.match(/[0-9]/)) {
          const p = cleanPrice(txt);
          if (p && p < 1000000 && p >= (result.price || 0)) result.mrp = p;
       }
     });
  }

  if (!result.mrp && potentialPrices.length > 1) {
      const p1 = potentialPrices[0];
      const p2 = potentialPrices[1];
      if (Math.abs(p1 - p2) > 0) {
         result.price = Math.min(p1, p2);
         result.mrp = Math.max(p1, p2);
      }
  }

  if (!result.mrp || result.mrp < result.price) result.mrp = result.price;

  // Find Discount
  $('*').not('script, style, noscript, svg, path').each((i, el) => {
    if ($(el).children().length === 0) {
      const txt = $(el).text().trim().toLowerCase();
      if ((txt.includes('%') && txt.includes('off') && txt.length < 20) || txt.match(/^[0-9]{1,2}%$/)) {
        if (!result.discount) result.discount = txt.replace(/[^0-9%]/g, '');
      }
    }
  });

  // Find Rating/Reviews
  let foundRating = null;
  let foundReviews = null;
  $('*').not('script, style, noscript, svg, path').each((i, el) => {
    if ($(el).children().length === 0) {
      const txt = $(el).text().trim();
      if (!foundRating && txt.match(/^[0-5].[0-9]\s*(★|\*|star)/i) && txt.length < 15) {
        foundRating = parseFloat(txt);
      }
      if (!foundReviews && txt.match(/^\([0-9,]+\)$/)) {
        foundReviews = txt.replace(/[^0-9]/g, '');
      } else if (!foundReviews && txt.toLowerCase().includes('rating') && txt.match(/[0-9,]+/) && txt.length < 30) {
        foundReviews = txt.replace(/[^0-9]/g, '');
      }
    }
  });

  if (foundRating && !result.rating) result.rating = foundRating;
  if (foundReviews && !result.reviewsCount) result.reviewsCount = foundReviews;
  
  if (result.discount && !result.discount.includes('%')) result.discount += '%';

  return result;
};
`;

const regex = /const getUniversalData = \(html\) => \{[\s\S]*?return result;\n\};\n/g;
content = content.replace(regex, universalStr);

fs.writeFileSync(path, content, 'utf8');
console.log("Universal scraper logic patched!");
