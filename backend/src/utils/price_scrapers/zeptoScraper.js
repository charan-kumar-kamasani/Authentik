const axios = require('axios');
const cheerio = require('cheerio');

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
});

const getZeptoData = async (url) => {
  try {
    const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null, siteImage: null };

    // 1. Fetch HTML page
    const htmlResponse = await axios.get(url, {
      headers: getHeaders(),
      timeout: 10000
    });
    const html = htmlResponse.data;
    const $ = cheerio.load(html);

    // 2. Extract SEO Microdata (Highly stable)
    const priceStr = $('[itemProp="price"]').attr('content') || $('[itemProp="price"]').text();
    if (priceStr) result.price = cleanPrice(priceStr);

    const ratingStr = $('[itemProp="ratingValue"]').attr('content') || $('[itemProp="ratingValue"]').text();
    if (ratingStr) result.rating = parseFloat(ratingStr);

    const reviewsStr = $('[itemProp="reviewCount"]').attr('content') || $('[itemProp="reviewCount"]').text();
    if (reviewsStr) result.reviewsCount = reviewsStr.replace(/[^0-9]/g, '');

    // 3. Extract MRP from embedded JSON state
    // Zepto stores MRP in cents (e.g. 103900 = 1039 INR). Account for escaped quotes in Next.js Flight JSON.
    const mrpMatch = html.match(/\\?"mrp\\?":(\d+)/);
    if (mrpMatch) {
      const mrpRaw = parseInt(mrpMatch[1], 10);
      result.mrp = mrpRaw / 100; // Convert from paise/cents to INR
    }

    // Attempt to calculate discount if we have price and MRP
    if (result.price && result.mrp && result.mrp > result.price) {
      const diff = result.mrp - result.price;
      const pct = Math.round((diff / result.mrp) * 100);
      result.discount = pct + '%';
    }

    return result;
  } catch (err) {
    console.error('Error fetching Zepto data:', err.message);
    return null;
  }
};

module.exports = {
  getZeptoData
};
