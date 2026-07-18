const axios = require('axios');
const cheerio = require('cheerio');

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"macOS"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
});

const getAmazonData = async (url) => {
  try {
    const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null, siteImage: null };

    // 1. Fetch main HTML page
    const htmlResponse = await axios.get(url, {
      headers: getHeaders(),
      timeout: 10000
    });
    const html = htmlResponse.data;
    
    // Fallback Cheerio Extraction for ratings/images
    const $ = cheerio.load(html);

    // 2. Extract IDs for hidden API
    const parentAsinMatch = html.match(/"parentAsin"\s*:\s*"([^"]+)"/);
    const parentAsin = parentAsinMatch ? parentAsinMatch[1] : null;
    
    let asin = null;
    const urlAsinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
    if (urlAsinMatch) {
      asin = urlAsinMatch[1];
    } else {
      const asinMatch = html.match(/"asin"\s*:\s*"([A-Z0-9]{10})"/);
      if (asinMatch) asin = asinMatch[1];
    }

    // 3. Hit the hidden Twister JSON API if we have the IDs
    let apiSuccess = false;
    if (asin && parentAsin) {
      try {
        const apiUrl = `https://www.amazon.in/gp/product/ajax/twisterDimensionSlotsDefault?isDimensionSlotsAjax=1&asin=${asin}&parentAsin=${parentAsin}`;
        const apiResponse = await axios.get(apiUrl, {
          headers: {
            ...getHeaders(),
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest'
          },
          timeout: 5000
        });

        if (apiResponse.data && apiResponse.data.Value && apiResponse.data.Value.content) {
           const slotJson = apiResponse.data.Value.content.twisterSlotJson;
           if (slotJson && slotJson.price) {
             result.price = cleanPrice(slotJson.price);
             apiSuccess = true;
           }
        }
      } catch (err) {
        console.error('Amazon Hidden API call failed:', err.message);
      }
    }

    // 4. Fallback HTML Scraping for missing data
    if (!result.price) {
      let priceText = $('.a-price-whole').first().text().trim() || $('#priceblock_ourprice').text().trim() || $('.a-price .a-offscreen').first().text().trim();
      if (priceText) result.price = cleanPrice(priceText);
    }
    
    if (!result.mrp) {
      let mrpText = $('.a-text-price[data-a-strike="true"] .a-offscreen').first().text().trim() || $('.priceBlockStrikePriceString').text().trim();
      if (mrpText) result.mrp = cleanPrice(mrpText);
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

    if (result.price && result.mrp && result.mrp > result.price && !result.discount) {
      const diff = result.mrp - result.price;
      const pct = Math.round((diff / result.mrp) * 100);
      result.discount = pct + '%';
    }

    return result;

  } catch (err) {
    console.error('Error fetching Amazon data:', err.message);
    return null;
  }
};

module.exports = {
  getAmazonData
};
