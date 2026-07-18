const axios = require('axios');
const cheerio = require('cheerio');

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
});

const getMyntraData = async (url) => {
  try {
    const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null, siteImage: null };

    // 1. Fetch main HTML page
    const htmlResponse = await axios.get(url, {
      headers: getHeaders(),
      timeout: 10000
    });
    const html = htmlResponse.data;

    // 2. Extract hidden JSON state
    const match = html.match(/window\.__myx\s*=\s*(\{.*?\});?\s*<\/script>/);
    if (match) {
      try {
        const state = JSON.parse(match[1]);
        const pdpData = state.pdpData || {};
        
        if (pdpData.price) {
          result.price = cleanPrice(pdpData.price.discounted || pdpData.price.mrp);
          result.mrp = cleanPrice(pdpData.price.mrp);
        }
        
        if (pdpData.ratings) {
            result.rating = pdpData.ratings.averageRating ? parseFloat(pdpData.ratings.averageRating) : null;
            result.reviewsCount = pdpData.ratings.totalCount ? pdpData.ratings.totalCount.toString() : null;
        }
        
        if (pdpData.media && pdpData.media.albums && pdpData.media.albums.length > 0) {
            const defaultAlbum = pdpData.media.albums.find(a => a.name === 'default') || pdpData.media.albums[0];
            if (defaultAlbum && defaultAlbum.images && defaultAlbum.images.length > 0) {
                // Replace Myntra image template placeholders with reasonable defaults
                let imgUrl = defaultAlbum.images[0].src;
                if (imgUrl) {
                    imgUrl = imgUrl.replace('($height)', '1080').replace('($width)', '1080').replace('($qualityPercentage)', '80');
                    result.siteImage = imgUrl;
                }
            }
        }
      } catch (err) {
        console.error("Error parsing Myntra JSON state:", err.message);
      }
    }

    // 3. Fallback to regex on HTML if state fails
    if (!result.price) {
        const priceMatch = html.match(/"price"\s*:\s*\{"mrp"\s*:\s*(\d+),\s*"discounted"\s*:\s*(\d+)/);
        if (priceMatch) {
            result.mrp = parseFloat(priceMatch[1]);
            result.price = parseFloat(priceMatch[2]);
        }
    }

    // Attempt to calculate discount if we have price and MRP
    if (result.price && result.mrp && result.mrp > result.price && !result.discount) {
      const diff = result.mrp - result.price;
      const pct = Math.round((diff / result.mrp) * 100);
      result.discount = pct + '%';
    }

    return result;
  } catch (err) {
    console.error('Error fetching Myntra data:', err.message);
    return null;
  }
};

module.exports = {
  getMyntraData
};
