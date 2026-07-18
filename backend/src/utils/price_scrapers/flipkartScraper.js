const axios = require('axios');
const cheerio = require('cheerio');

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getHeaders = () => ({
  // Using Googlebot bypasses Flipkart's 403 block for direct Axios requests
  'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
});

const getFlipkartData = async (url) => {
  try {
    const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null, siteImage: null };

    // 1. Fetch main HTML page
    const htmlResponse = await axios.get(url, {
      headers: getHeaders(),
      timeout: 10000
    });
    const html = htmlResponse.data;

    // 2. Extract hidden JSON state
    const match = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});\s*<\/script>/);
    if (match) {
      try {
        const state = JSON.parse(match[1]);
        
        let foundPrice = null;
        let foundMrp = null;
        let foundRating = null;
        let foundReviews = null;

        // Recursive search for pricing and rating nodes
        const findData = (obj) => {
          if (!obj || typeof obj !== 'object') return;
          
          if (obj.pricing && obj.pricing.finalPrice && obj.pricing.finalPrice.value) {
            if (!foundPrice) foundPrice = obj.pricing.finalPrice.value;
          }
          if (obj.pricing && obj.pricing.displayPrice) {
            if (!foundPrice) foundPrice = obj.pricing.displayPrice;
          }
          if (obj.prices && obj.prices.price) {
             if (!foundPrice) foundPrice = obj.prices.price;
          }
          if (obj['@type'] === 'Offer' && obj.price) {
            if (!foundPrice) foundPrice = obj.price;
          }
          
          // Rating extraction - Strict check for AggregateRating to avoid individual rating breakdowns
          if (obj['@type'] === 'AggregateRating') {
            if (obj.ratingValue) foundRating = obj.ratingValue;
            if (obj.ratingCount) foundReviews = obj.ratingCount;
            else if (obj.reviewCount) foundReviews = obj.reviewCount;
          }
          
          Object.values(obj).forEach(val => findData(val));
        };

        findData(state);

        if (foundPrice) result.price = cleanPrice(foundPrice);
        if (foundMrp) result.mrp = cleanPrice(foundMrp); // Often not in JSON, fallback to HTML
        if (foundRating) result.rating = parseFloat(foundRating);
        if (foundReviews) result.reviewsCount = foundReviews.toString();

      } catch (err) {
        console.error("Error parsing Flipkart JSON state:", err.message);
      }
    }

    // Advanced Regex fallback directly on HTML for missing data (bypassing DOM class changes)
    if (!result.mrp) {
       const mrpMatch = html.match(/"strikeOffPrice"\s*:\s*(\d+)/) || html.match(/"mrp"\s*:\s*(\d+)/);
       if (mrpMatch) result.mrp = cleanPrice(mrpMatch[1]);
    }
    
    if (!result.rating) {
       const ratingMatch = html.match(/"average"\s*:\s*(\d+\.\d+)/);
       if (ratingMatch) result.rating = parseFloat(ratingMatch[1]);
    }
    
    if (!result.reviewsCount) {
       const countMatch = html.match(/"count"\s*:\s*(\d+)/);
       if (countMatch) result.reviewsCount = countMatch[1];
    }

    // 3. Fallback to HTML DOM for any remaining missing data
    const $ = cheerio.load(html);
    
    // Try Desktop Classes
    let mrpText = $('.yRaY8j').first().text().trim() || $('._3I9_wc').first().text().trim() || $('.CxhGGd').first().text().trim();
    if (mrpText && !result.mrp) result.mrp = cleanPrice(mrpText);

    let ratingText = $('div.XQDdHH').first().text().trim();
    if (ratingText) result.rating = parseFloat(ratingText);

    let reviewsText = $('span.Wphh3N').first().text().trim();
    if (reviewsText) result.reviewsCount = reviewsText.split(' ')[0].replace(/[^0-9,]/g, '');

    // Mobile specific classes fallback
    if (!result.mrp) {
      let mobileMrpText = $('.css-146c3p1.r-11wrixw').first().text().trim();
      if (mobileMrpText) result.mrp = cleanPrice(mobileMrpText);
    }

    // Attempt to calculate discount if we have price and MRP
    if (result.price && result.mrp && result.mrp > result.price) {
      const diff = result.mrp - result.price;
      const pct = Math.round((diff / result.mrp) * 100);
      result.discount = pct + '%';
    }

    return result;
  } catch (err) {
    console.error('Error fetching Flipkart data:', err.message);
    return null;
  }
};

module.exports = {
  getFlipkartData
};
