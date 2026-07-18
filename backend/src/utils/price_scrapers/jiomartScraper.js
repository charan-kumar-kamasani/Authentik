const axios = require('axios');
const cheerio = require('cheerio');

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getJiomartData = async (url) => {
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

    // Initial state regex
    const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\})/);
    if (stateMatch) {
      try {
        const state = JSON.parse(stateMatch[1]);
        const findData = (obj) => {
          if (!obj || typeof obj !== 'object') return;
          if (obj.selling_price || obj.mrp) {
             if (!result.price) result.price = cleanPrice(obj.selling_price || obj.price);
             if (!result.mrp) result.mrp = cleanPrice(obj.mrp);
          }
          if (obj.image_url && !result.siteImage) {
             result.siteImage = obj.image_url;
          }
          Object.values(obj).forEach(val => findData(val));
        };
        findData(state);
      } catch (e) {
        // ignore
      }
    }

    // JSON-LD fallback for Jiomart
    if (!result.price) {
        $('script[type="application/ld+json"]').each((i, el) => {
          try {
            const data = JSON.parse($(el).html());
            const extractProduct = (d) => {
              if (d['@type'] === 'Product') {
                if (d.offers && d.offers.price) result.price = cleanPrice(d.offers.price);
                if (d.image) result.siteImage = Array.isArray(d.image) ? d.image[0] : d.image;
                if (d.aggregateRating) {
                    result.rating = parseFloat(d.aggregateRating.ratingValue);
                    result.reviewsCount = d.aggregateRating.reviewCount;
                }
              }
            };
            if (Array.isArray(data)) data.forEach(extractProduct);
            else extractProduct(data);
          } catch(e){}
        });
    }

    // DOM Fallback
    if (!result.price) {
        result.price = cleanPrice($('.jm-heading-s').first().text()) || cleanPrice($('#price').text());
        result.mrp = cleanPrice($('.jm-body-s-bold').first().text()) || cleanPrice($('#mrp').text());
    }

    if (result.price && result.mrp && result.mrp > result.price && !result.discount) {
      const diff = result.mrp - result.price;
      const pct = Math.round((diff / result.mrp) * 100);
      result.discount = pct + '%';
    }

    return result;
  } catch (err) {
    console.error('Error fetching Jiomart data:', err.message);
    return null;
  }
};

module.exports = {
  getJiomartData
};
