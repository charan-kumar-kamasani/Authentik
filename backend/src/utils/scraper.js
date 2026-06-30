const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

let browserInstance = null;

const getBrowser = async () => {
  if (!browserInstance) {
    console.log('[Scraper] Launching Headless Browser instance...');
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }
  return browserInstance;
};

const closeBrowser = async () => {
  if (browserInstance) {
    console.log('[Scraper] Closing Browser instance...');
    await browserInstance.close();
    browserInstance = null;
  }
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

const getFlipkartPrice = (html) => {
  const result = getUniversalData(html);
  const $ = cheerio.load(html);
  
  // Try Desktop Classes first
  let priceText = $('.Nx9bqj.CrvlNf').first().text().trim() || $('._30jeq3').first().text().trim();
  let mrpText = $('.yRaY8j').first().text().trim() || $('._3I9_wc').first().text().trim();
  let discountText = $('.UkUFwK').first().text().trim() || $('._3Ay6Sb').first().text().trim();
  let ratingText = $('div.XQDdHH').first().text().trim();
  let reviewsText = $('span.Wphh3N').first().text().trim();

  // If no desktop classes, try Mobile Web (React Native Web) classes
  if (!priceText) {
    const potentialPrices = [];
    $('*').not('script, style, svg, noscript').each((i, el) => {
      const txt = $(el).text().trim();
      if (txt.startsWith('₹') && txt.length < 15 && $(el).children().length === 0) {
         potentialPrices.push(cleanPrice(txt));
      }
    });
    
    // Try specific Mobile MRP class provided by user
    let mobileMrpText = $('.css-146c3p1.r-11wrixw').first().text().trim();
    if (mobileMrpText) {
      result.mrp = cleanPrice(mobileMrpText);
    } else if (result.price) {
      // Find the first MRP that is greater than the JSON-LD price (but not astronomically higher)
      const higherPrices = potentialPrices.filter(p => p > result.price && p < result.price * 3);
      if (higherPrices.length > 0) {
        result.mrp = higherPrices[0]; // First higher price found in DOM
      } else {
        result.mrp = result.price; // No higher MRP found
      }
    } else {
      // Fallback if no JSON-LD
      if (potentialPrices.length >= 2) {
         const p1 = potentialPrices[0];
         const p2 = potentialPrices[1];
         result.price = Math.min(p1, p2);
         result.mrp = Math.max(p1, p2);
      } else if (potentialPrices.length === 1) {
         result.price = potentialPrices[0];
      }
    }
  } else {
    if (priceText) result.price = cleanPrice(priceText);
    if (mrpText) result.mrp = cleanPrice(mrpText);
  }

  if (discountText) result.discount = discountText.replace(/[^0-9%]/g, '');
  if (ratingText) result.rating = parseFloat(ratingText);
  if (reviewsText) result.reviewsCount = reviewsText.split(' ')[0].replace(/[^0-9,]/g, '');

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

const getAmazonPrice = (html) => {

  const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null };
  const $ = cheerio.load(html);
  
  if (!result.price) {
    let priceText = $('.a-price-whole').first().text().trim() || $('#priceblock_ourprice').text().trim() || $('.a-price .a-offscreen').first().text().trim();
    if (priceText) result.price = cleanPrice(priceText);
  }
  
  if (!result.mrp) {
    let mrpText = $('.a-text-price .a-offscreen').first().text().trim() || $('.priceBlockStrikePriceString').text().trim();
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
  
  return result;
};

const scrapeProductPrice = async (rawUrl) => {
  if (!rawUrl) return null;
  const url = rawUrl.split(' ')[0].trim();
  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    page.setDefaultNavigationTimeout(30000);

    await page.goto(url, { waitUntil: 'networkidle2' });
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // wait for dynamic scripts
    
    const html = await page.content();
    
    const lowerUrl = url.toLowerCase();
    let result = null;
    
    if (lowerUrl.includes('amazon.in') || lowerUrl.includes('amzn.in')) {
      result = getAmazonPrice(html);
    } else if (lowerUrl.includes('flipkart.com')) {
      result = getFlipkartPrice(html);
    } else if (lowerUrl.includes('croma.com')) {
      result = getCromaPrice(html);
    } else if (lowerUrl.includes('optimumnutrition.co.in')) {
      result = getONPrice(html);
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
      
      // We return the result even if price is missing so we can at least save the logo/rating if found
      return result;
    }
    return null;
  } catch (err) {
    console.error('Scraping error for', url, ':', err.message);
    return null;
  } finally {
    if (page) await page.close();
  }
};

module.exports = {
  scrapeProductPrice,
  closeBrowser
};
