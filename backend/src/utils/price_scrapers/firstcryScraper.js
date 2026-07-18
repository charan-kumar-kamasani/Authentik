const axios = require('axios');
const cheerio = require('cheerio');

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getFirstcryData = async (url) => {
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
    const stateMatch = html.match(/var\s+productDetails\s*=\s*(\{.*?\});/);
    if (stateMatch) {
      try {
        const state = JSON.parse(stateMatch[1]);
        if (state.price || state.mrp) {
           result.price = cleanPrice(state.price);
           result.mrp = cleanPrice(state.mrp);
        }
      } catch (e) {
        // ignore
      }
    }

    // JSON-LD fallback for FirstCry
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
    
    // Fallback parsing inline scripts that contain standard price config
    if (!result.price) {
       const scriptBlocks = $('script').map((i, el) => $(el).html()).get();
       for (const script of scriptBlocks) {
           if (script && script.includes('mrp:') && script.includes('price:')) {
               const priceMatch = script.match(/price:\s*['"]?([0-9.]+)['"]?/i);
               const mrpMatch = script.match(/mrp:\s*['"]?([0-9.]+)['"]?/i);
               if (priceMatch && !result.price) result.price = cleanPrice(priceMatch[1]);
               if (mrpMatch && !result.mrp) result.mrp = cleanPrice(mrpMatch[1]);
           }
       }
    }

    if (result.price && result.mrp && result.mrp > result.price && !result.discount) {
      const diff = result.mrp - result.price;
      const pct = Math.round((diff / result.mrp) * 100);
      result.discount = pct + '%';
    }

    return result;
  } catch (err) {
    console.error('Error fetching FirstCry data:', err.message);
    return null;
  }
};

module.exports = {
  getFirstcryData
};
