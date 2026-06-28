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

const getUniversalData = (html) => {
  const $ = cheerio.load(html);
  const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null };

  // 1. JSON-LD Schema.org extraction
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const data = JSON.parse($(el).html());
      const checkSchema = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        
        if (obj['@type'] === 'Product' || obj['@type'] === 'http://schema.org/Product') {
          if (obj.offers && obj.offers.price && !result.price) {
            result.price = parseFloat(obj.offers.price);
          }
          if (obj.aggregateRating) {
            if (obj.aggregateRating.ratingValue && !result.rating) result.rating = parseFloat(obj.aggregateRating.ratingValue);
            if (obj.aggregateRating.ratingCount) result.reviewsCount = obj.aggregateRating.ratingCount;
            else if (obj.aggregateRating.reviewCount && !result.reviewsCount) result.reviewsCount = obj.aggregateRating.reviewCount;
          }
        }
        Object.values(obj).forEach(val => checkSchema(val));
      };
      
      if (Array.isArray(data)) data.forEach(d => checkSchema(d));
      else checkSchema(data);
    } catch(e) {}
  });

    // 2. Aggressive Text Heuristics for Price, MRP, Discount
  const textNodes = [];
  $('*').not('script, style, noscript, svg, path').each((i, el) => {
    if ($(el).children().length === 0) {
      const txt = $(el).text().trim();
      if (txt) textNodes.push(txt);
    }
  });

  const prices = [];
  const discounts = [];
  let foundRating = null;
  let foundReviews = null;

  textNodes.forEach(text => {
    // Discounts
    if (text.includes('%') && text.toLowerCase().includes('off') && text.length < 20) {
      discounts.push(text.replace(/[^0-9%]/g, ''));
    } else if (text.match(/^[0-9]{1,2}%$/)) {
      discounts.push(text);
    }

    // Ratings
    if (!foundRating && text.match(/^[0-5].[0-9]\s*(★|\*|star)/i) && text.length < 15) {
      foundRating = parseFloat(text);
    }

    // Reviews
    if (!foundReviews && text.match(/^\([0-9,]+\)$/)) {
      foundReviews = text.replace(/[^0-9]/g, '');
    } else if (!foundReviews && text.toLowerCase().includes('rating') && text.match(/[0-9,]+/) && text.length < 30) {
      foundReviews = text.replace(/[^0-9]/g, '');
    }
  });

  // Extract prices using regex on the entire body text to handle separated currency symbols (e.g. Zepto)
  const bodyText = $('body').text().replace(/\s+/g, ' ');
  const regexMatches = [...bodyText.matchAll(/(?:₹|rs\.?)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi)];
  regexMatches.forEach(m => {
    const p = parseFloat(m[1].replace(/,/g, ''));
    if (!isNaN(p) && p > 0 && p < 500000) prices.push(p);
  });

  // If JSON-LD found a price, use regex prices to find discounts or MRP
  if (result.price) {
    const validPrices = prices.slice(0, 10).filter(p => p > 0);
    if (validPrices.length > 0) {
      const minP = Math.min(...validPrices);
      const maxP = Math.max(...validPrices);
      
      if (minP < result.price && minP >= result.price * 0.2) {
        result.price = minP; // Found a discounted price that JSON-LD missed
      }
      if (maxP > result.price && maxP <= result.price * 5) {
        result.mrp = maxP; // Found a valid MRP
      } else if (!result.mrp) {
        result.mrp = result.price;
      }
    }
  } else {
    if (prices.length >= 2) {
      const p1 = prices[0];
      const p2 = prices[1];
      result.price = Math.min(p1, p2);
      result.mrp = Math.max(p1, p2);
    } else if (prices.length === 1) {
      result.price = prices[0];
      result.mrp = prices[0];
    }
  }

  if (discounts.length > 0) {
    result.discount = discounts[0].includes('%') ? discounts[0] : discounts[0] + '%';
  }

  
  if (foundRating && !result.rating) result.rating = foundRating;
  if (foundReviews && !result.reviewsCount) result.reviewsCount = foundReviews;

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
         potentialPrices.push(parseFloat(txt.replace(/[^0-9.]/g, '')));
      }
    });
    
    // Try specific Mobile MRP class provided by user
    let mobileMrpText = $('.css-146c3p1.r-11wrixw').first().text().trim();
    if (mobileMrpText) {
      result.mrp = parseFloat(mobileMrpText.replace(/[^0-9.]/g, ''));
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
    if (priceText) result.price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    if (mrpText) result.mrp = parseFloat(mrpText.replace(/[^0-9.]/g, ''));
  }

  if (discountText) result.discount = discountText.replace(/[^0-9%]/g, '');
  if (ratingText) result.rating = parseFloat(ratingText);
  if (reviewsText) result.reviewsCount = reviewsText.split(' ')[0].replace(/[^0-9,]/g, '');

  return result;
};

const getAmazonPrice = (html) => {

  const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null };
  const $ = cheerio.load(html);
  
  if (!result.price) {
    let priceText = $('.a-price-whole').first().text().trim() || $('#priceblock_ourprice').text().trim() || $('.a-price .a-offscreen').first().text().trim();
    if (priceText) result.price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
  }
  
  if (!result.mrp) {
    let mrpText = $('.a-text-price .a-offscreen').first().text().trim() || $('.priceBlockStrikePriceString').text().trim();
    if (mrpText) result.mrp = parseFloat(mrpText.replace(/[^0-9.]/g, ''));
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

const scrapeProductPrice = async (url) => {
  if (!url) return null;
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
    } else {
      // Use Universal Scraper for Flipkart, Myntra, Meesho, Nykaa, etc.
      result = getUniversalData(html);
    }
    
    if (result && result.price) {
      try {
        const urlObj = new URL(url);
        result.siteImage = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${urlObj.origin}&size=64`;
      } catch(e) {}
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
