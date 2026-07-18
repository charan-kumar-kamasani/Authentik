const cheerio = require('cheerio');
const axios = require('axios');

const closeBrowser = async () => {
  // No-op for backward compatibility with priceScraperJob.js
};


const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};


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
    if (txt.match(/₹|rs.?/i)) {
      const p = cleanPrice(txt);
      if (p && p < 1000000 && (!result.mrp || p > result.mrp)) result.mrp = p;
    }
  });

  // Fallback for price and MRP if JSON-LD/meta failed
  const potentialPrices = [];
  $('*').not('script, style, noscript, svg, path').each((i, el) => {
    const txt = $(el).text().trim();
    if ($(el).children().length === 0 && txt.match(/^(?:₹|rs.?)s*[0-9,]+(?:.[0-9]{1,2})?$/i)) {
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
      if (!foundRating && txt.match(/^[0-5]\.[0-9]\s*(★|\*|star)/i) && txt.length < 15) {
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


const getONPrice = (html) => {
  const result = getUniversalData(html);
  const $ = require('cheerio').load(html);
  
  const salePrice = $('.selling-price-div .price-item').first().text();
  if (salePrice) {
    const p = cleanPrice(salePrice);
    if (p) result.price = p;
  }
  
  const regularPrice = $('.compare-price-div s').first().text();
  if (regularPrice) {
    const p = cleanPrice(regularPrice);
    if (p && p < 1000000) result.mrp = p;
  }
  
  const discountText = $('.sale-percentage').first().text();
  if (discountText) {
    result.discount = discountText.replace(/[^0-9%]/g, '');
  }
  
  if (result.price && result.mrp && result.mrp > result.price && !result.discount) {
    const diff = result.mrp - result.price;
    const pct = Math.round((diff / result.mrp) * 100);
    result.discount = pct + '%';
  }

  return result;
};




const getCromaPrice = (html) => {
  const result = getUniversalData(html); // Fallback to universal first
  const $ = require('cheerio').load(html);
  
  const pdpPrice = $('#pdp-product-price').attr('value') || $('#pdp-product-price').text();
  if (pdpPrice) {
    const p = cleanPrice(pdpPrice);
    if (p) result.price = p;
  }
  
  const oldPrice = $('#old-price').attr('data-value') || $('#old-price').text();
  if (oldPrice) {
    const p = cleanPrice(oldPrice);
    if (p) result.mrp = p;
  }
  
  // Recalculate discount if mrp and price found
  if (result.price && result.mrp && result.mrp > result.price) {
    const diff = result.mrp - result.price;
    const pct = Math.round((diff / result.mrp) * 100);
    result.discount = pct + '%';
  }

  return result;
};



const getBlinkitPrice = (html) => {
  const result = getUniversalData(html);
  const $ = cheerio.load(html);

  let found = false;
  $('span').each((i, el) => {
    if (found) return false;
    
    const text = $(el).text().trim().toUpperCase();
    if (text === 'MRP' || text.includes('MRP')) {
       const parent = $(el).parent(); // typically the containing span
       let currentMrp = null;
       let currentPrice = null;
       
       // Try finding next sibling span with the MRP price
       const nextSpan = $(el).next('span');
       if (nextSpan.length) {
         currentMrp = cleanPrice(nextSpan.text());
       } else {
         // Maybe it's in the same text
         const mrpMatch = parent.text().match(/MRP\s*(?:₹|Rs\.?)\s*([0-9,.]+)/i);
         if (mrpMatch) {
            currentMrp = cleanPrice(mrpMatch[1]);
         }
       }

       // Selling price is in the previous sibling of the parent's parent div
       let priceContainer = parent.parent().prev('div');
       if (priceContainer.length && priceContainer.text().includes('₹')) {
          currentPrice = cleanPrice(priceContainer.text());
       } else {
         // Fallback: look at immediate parent's prev sibling if structure is flatter
         priceContainer = parent.prev('div');
         if (priceContainer.length && priceContainer.text().includes('₹')) {
            currentPrice = cleanPrice(priceContainer.text());
         }
       }
       
       if (currentMrp && currentPrice) {
           result.mrp = currentMrp;
           result.price = currentPrice;
           found = true;
       }
    }
  });

  // Calculate discount percentage if we have price and mrp
  if (result.price && result.mrp && result.mrp > result.price) {
    const diff = result.mrp - result.price;
    const pct = Math.round((diff / result.mrp) * 100);
    result.discount = pct + '%';
  }

  return result;
};

const getSwiggyInstamartPrice = (html) => {
  const result = getUniversalData(html);
  const $ = cheerio.load(html);

  const offerEl = $('[data-testid="item-offer-price"]').first();
  if (offerEl.length) {
    const p = cleanPrice(offerEl.attr('aria-label') || offerEl.text());
    if (p) result.price = p;
  }

  const mrpEl = $('[data-testid="item-mrp-price"]').first();
  if (mrpEl.length) {
    const p = cleanPrice(mrpEl.attr('aria-label') || mrpEl.text());
    if (p) result.mrp = p;
  }

  // Fallback if data-testids are slightly different
  if (!result.price || !result.mrp) {
     const container = $('[data-testid="itemMRPPrice"]').first();
     if (container.length) {
       const prices = [];
       container.children().each((i, el) => {
          const p = cleanPrice($(el).attr('aria-label') || $(el).text());
          if (p) prices.push(p);
       });
       if (prices.length >= 2) {
          result.price = Math.min(prices[0], prices[1]);
          result.mrp = Math.max(prices[0], prices[1]);
       } else if (prices.length === 1) {
          result.price = prices[0];
       }
     }
  }

  // Calculate discount percentage
  if (result.price && result.mrp && result.mrp > result.price) {
    const diff = result.mrp - result.price;
    const pct = Math.round((diff / result.mrp) * 100);
    result.discount = pct + '%';
  }

  return result;
};

const getJioMartPrice = (html) => {
  const result = getUniversalData(html);
  const $ = cheerio.load(html);

  const currentPriceEl = $('.PriceContainer__currentPrice').first();
  if (currentPriceEl.length) {
    const p = cleanPrice(currentPriceEl.text());
    if (p) result.price = p;
  }

  const originalPriceEl = $('.PriceContainer__originalPrice').first();
  if (originalPriceEl.length) {
    const p = cleanPrice(originalPriceEl.text());
    if (p) result.mrp = p;
  }

  const discountEl = $('.PriceContainer__discountText').first();
  if (discountEl.length) {
    const txt = discountEl.text().replace(/[^0-9]/g, '');
    if (txt) result.discount = txt + '%';
  }

  if (result.price && result.mrp && result.mrp > result.price && !result.discount) {
    const diff = result.mrp - result.price;
    const pct = Math.round((diff / result.mrp) * 100);
    result.discount = pct + '%';
  }

  return result;
};


const scrapeProductPrice = async (rawUrl) => {
  if (!rawUrl) return null;
  const url = rawUrl.split(' ')[0].trim();
  
  try {
    const lowerUrl = url.toLowerCase();
    
    // Delegate Amazon URLs
    if (lowerUrl.includes('amazon.in') || lowerUrl.includes('amzn.in')) {
      const { getAmazonData } = require('./price_scrapers/amazonScraper');
      const result = await getAmazonData(url);
      if (result && !result.siteImage) {
        result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      }
      return result;
    }
    
    // Delegate Flipkart URLs
    if (lowerUrl.includes('flipkart.com')) {
      const { getFlipkartData } = require('./price_scrapers/flipkartScraper');
      const result = await getFlipkartData(url);
      if (result && !result.siteImage) {
        result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      }
      return result;
    }

    // Delegate Zepto URLs
    if (lowerUrl.includes('zepto.com')) {
      const { getZeptoData } = require('./price_scrapers/zeptoScraper');
      const result = await getZeptoData(url);
      if (result && !result.siteImage) {
        result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      }
      return result;
    }

    // Delegate Blinkit URLs
    if (lowerUrl.includes('blinkit.com')) {
      const { getBlinkitData } = require('./price_scrapers/blinkitScraper');
      const result = await getBlinkitData(url);
      if (result && !result.siteImage) {
        result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      }
      return result;
    }

    // Delegate Myntra URLs
    if (lowerUrl.includes('myntra.com')) {
      const { getMyntraData } = require('./price_scrapers/myntraScraper');
      const result = await getMyntraData(url);
      if (result && !result.siteImage) {
        result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      }
      return result;
    }

    // Delegate Nykaa URLs
    if (lowerUrl.includes('nykaa.com')) {
      const { getNykaaData } = require('./price_scrapers/nykaaScraper');
      const result = await getNykaaData(url);
      if (result && !result.siteImage) {
        result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      }
      return result;
    }

    // Delegate Meesho URLs
    if (lowerUrl.includes('meesho.com')) {
      const { getMeeshoData } = require('./price_scrapers/meeshoScraper');
      const result = await getMeeshoData(url);
      if (result && !result.siteImage) {
        result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      }
      return result;
    }

    // Delegate Instamart URLs
    if (lowerUrl.includes('swiggy.com/instamart')) {
      const { getInstamartData } = require('./price_scrapers/instamartScraper');
      const result = await getInstamartData(url);
      if (result && !result.siteImage) {
        result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      }
      return result;
    }

    // Delegate Ajio URLs
    if (lowerUrl.includes('ajio.com')) {
      const { getAjioData } = require('./price_scrapers/ajioScraper');
      const result = await getAjioData(url);
      if (result && !result.siteImage) result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      return result;
    }

    // Delegate BigBasket URLs
    if (lowerUrl.includes('bigbasket.com')) {
      const { getBigbasketData } = require('./price_scrapers/bigbasketScraper');
      const result = await getBigbasketData(url);
      if (result && !result.siteImage) result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      return result;
    }

    // Delegate JioMart URLs
    if (lowerUrl.includes('jiomart.com')) {
      const { getJiomartData } = require('./price_scrapers/jiomartScraper');
      const result = await getJiomartData(url);
      if (result && !result.siteImage) result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      return result;
    }

    // Delegate FirstCry URLs
    if (lowerUrl.includes('firstcry.com')) {
      const { getFirstcryData } = require('./price_scrapers/firstcryScraper');
      const result = await getFirstcryData(url);
      if (result && !result.siteImage) result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      return result;
    }

    // Delegate Purplle URLs
    if (lowerUrl.includes('purplle.com')) {
      const { getPurplleData } = require('./price_scrapers/purplleScraper');
      const result = await getPurplleData(url);
      if (result && !result.siteImage) result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      return result;
    }

    // Delegate Tata CLiQ URLs
    if (lowerUrl.includes('tatacliq.com')) {
      const { getTatacliqData } = require('./price_scrapers/tatacliqScraper');
      const result = await getTatacliqData(url);
      if (result && !result.siteImage) result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      return result;
    }

    // Delegate Snapdeal URLs
    if (lowerUrl.includes('snapdeal.com')) {
      const { getSnapdealData } = require('./price_scrapers/snapdealScraper');
      const result = await getSnapdealData(url);
      if (result && !result.siteImage) result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      return result;
    }

    // Delegate PharmEasy URLs
    if (lowerUrl.includes('pharmeasy.in')) {
      const { getPharmeasyData } = require('./price_scrapers/pharmeasyScraper');
      const result = await getPharmeasyData(url);
      if (result && !result.siteImage) result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      return result;
    }

    // Delegate Apollo 24/7 URLs
    if (lowerUrl.includes('apollopharmacy.in')) {
      const { getApollo247Data } = require('./price_scrapers/apollo247Scraper');
      const result = await getApollo247Data(url);
      if (result && !result.siteImage) result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      return result;
    }

    // Delegate Croma URLs
    if (lowerUrl.includes('croma.com')) {
      const { getCromaData } = require('./price_scrapers/cromaScraper');
      const result = await getCromaData(url);
      if (result && !result.siteImage) result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      return result;
    }

    // Delegate Reliance Digital URLs
    if (lowerUrl.includes('reliancedigital.in')) {
      const { getReliancedigitalData } = require('./price_scrapers/reliancedigitalScraper');
      const result = await getReliancedigitalData(url);
      if (result && !result.siteImage) result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      return result;
    }

    // Delegate Pepperfry URLs
    if (lowerUrl.includes('pepperfry.com')) {
      const { getPepperfryData } = require('./price_scrapers/pepperfryScraper');
      const result = await getPepperfryData(url);
      if (result && !result.siteImage) result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${new URL(url).origin}&size=128`;
      return result;
    }

    // Pure Axios for other retailers (NO scrape.do)
    const response = await axios.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000 
    });
    const html = response.data;
    
    let result = null;
    
    if (lowerUrl.includes('croma.com')) {
      result = getCromaPrice(html);
    } else if (lowerUrl.includes('optimumnutrition.co.in')) {
      result = getONPrice(html);
    } else if (lowerUrl.includes('blinkit.com')) {
      result = getBlinkitPrice(html);
    } else if (lowerUrl.includes('swiggy.com')) {
      result = getSwiggyInstamartPrice(html);
    } else if (lowerUrl.includes('jiomart.com')) {
      result = getJioMartPrice(html);
    } else {
      result = getUniversalData(html);
    }
    
    if (result) {
      try {
        const cheerio = require('cheerio');
        const $ = cheerio.load(html);
        let siteImage = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || $('meta[property="og:image"]').attr('content');
        const urlObj = new URL(url);
        
        if (siteImage) {
          result.siteImage = new URL(siteImage, url).href;
        } else {
          result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${urlObj.origin}&size=128`;
        }
      } catch(e) {}
      
      return result;
    }
    return null;
  } catch (err) {
    console.error('Scraping error for', url, ':', err.message);
    return null;
  }
};

module.exports = {
  scrapeProductPrice,
  closeBrowser
};
