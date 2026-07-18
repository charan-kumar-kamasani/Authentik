const axios = require('axios');
const cheerio = require('cheerio');

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getBigbasketData = async (url) => {
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
        const productDetails = data?.props?.pageProps?.productDetails;
        
        if (productDetails) {
            result.price = cleanPrice(productDetails.pricing?.discount?.mrp || productDetails.pricing?.discount?.sp);
            // Wait, typically SP is the selling price and MRP is the original.
            result.price = cleanPrice(productDetails.pricing?.discount?.mrp) ? cleanPrice(productDetails.pricing?.discount?.mrp) : cleanPrice(productDetails.pricing?.discount?.sp);
            // Let's refine Bigbasket pricing. Usually `mrp` in some NextJS state actually means 'maximum retail price', wait.
            // Let's do a deep search
            const findData = (obj) => {
              if (!obj || typeof obj !== 'object') return;
              if (obj.mrp && obj.sp) {
                  result.price = cleanPrice(obj.sp);
                  result.mrp = cleanPrice(obj.mrp);
              } else if (obj.pricing && obj.pricing.discount) {
                  result.price = cleanPrice(obj.pricing.discount.mrp - obj.pricing.discount.d_amount || obj.pricing.discount.sp);
                  result.mrp = cleanPrice(obj.pricing.discount.mrp);
              }
              if (obj.images && Array.isArray(obj.images) && obj.images.length > 0 && !result.siteImage) {
                 result.siteImage = obj.images[0].url || obj.images[0].s || obj.images[0].l;
              }
              Object.values(obj).forEach(val => findData(val));
            };
            findData(data);
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }

    // JSON-LD fallback for Bigbasket
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

    if (result.price && result.mrp && result.mrp > result.price && !result.discount) {
      const diff = result.mrp - result.price;
      const pct = Math.round((diff / result.mrp) * 100);
      result.discount = pct + '%';
    }

    return result;
  } catch (err) {
    console.error('Error fetching Bigbasket data:', err.message);
    return null;
  }
};

module.exports = {
  getBigbasketData
};
