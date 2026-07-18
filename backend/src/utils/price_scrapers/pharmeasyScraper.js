const axios = require('axios');
const cheerio = require('cheerio');

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getPharmeasyData = async (url) => {
  try {
    const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null, siteImage: null };

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const nextDataText = $('#__NEXT_DATA__').html();
    if (nextDataText) {
      try {
        const data = JSON.parse(nextDataText);
        
        const findData = (obj) => {
          if (!obj || typeof obj !== 'object') return;
          if (obj.salePrice || obj.mrp || obj.price) {
             if (!result.price) result.price = cleanPrice(obj.salePrice || obj.price);
             if (!result.mrp) result.mrp = cleanPrice(obj.mrp);
          }
          if (obj.images && Array.isArray(obj.images) && obj.images.length > 0 && !result.siteImage) {
             result.siteImage = obj.images[0];
          }
          Object.values(obj).forEach(val => findData(val));
        };
        findData(data);
      } catch (e) {}
    }

    if (result.price && result.mrp && result.mrp > result.price && !result.discount) {
      const diff = result.mrp - result.price;
      const pct = Math.round((diff / result.mrp) * 100);
      result.discount = pct + '%';
    }

    return result;
  } catch (err) {
    console.error('Error fetching PharmEasy data:', err.message);
    return null;
  }
};

module.exports = { getPharmeasyData };
