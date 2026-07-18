const cheerio = require('cheerio');

const cleanPrice = (str) => {
  if (!str) return null;
  const num = parseFloat(str.toString().replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

const getMeeshoData = async (url) => {
  try {
    const result = { price: null, mrp: null, discount: null, rating: null, reviewsCount: null, siteImage: null };

    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());

    let html = '';
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9'
      });
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      html = await page.content();
    } finally {
      await browser.close();
    }

    const $ = cheerio.load(html);

    // Try __NEXT_DATA__ first
    const nextDataText = $('#__NEXT_DATA__').html();
    if (nextDataText) {
      try {
        const data = JSON.parse(nextDataText);
        const productData = data?.props?.pageProps?.initialState?.product?.details?.data;
        if (productData) {
           result.price = cleanPrice(productData.discounted_price || productData.price || productData.min_price);
           result.mrp = cleanPrice(productData.mrp || productData.original_price);
           if (productData.images && productData.images.length > 0) {
              result.siteImage = productData.images[0];
           }
           if (productData.review_summary && productData.review_summary.data) {
              result.rating = parseFloat(productData.review_summary.data.average_rating);
              result.reviewsCount = productData.review_summary.data.rating_count ? productData.review_summary.data.rating_count.toString() : null;
           }
        }
      } catch (e) {
        // Ignore parse error
      }
    }

    // Fallback DOM extraction for Meesho
    if (!result.price) {
        // Try to find the h4 element that contains the Rupee symbol
        $('h4').each((i, el) => {
            const text = $(el).text();
            if (text.includes('₹') && !result.price) {
                result.price = cleanPrice(text);
            }
        });
    }

    if (!result.mrp) {
        // Find struck-through price
        $('span').each((i, el) => {
            const text = $(el).text();
            if (text.includes('₹') && $(el).css('text-decoration')?.includes('line-through') && !result.mrp) {
                result.mrp = cleanPrice(text);
            }
        });
    }

    // Calculate discount if missing
    if (result.price && result.mrp && result.mrp > result.price && !result.discount) {
      const diff = result.mrp - result.price;
      const pct = Math.round((diff / result.mrp) * 100);
      result.discount = pct + '%';
    }

    return result;
  } catch (err) {
    console.error('Error fetching Meesho data:', err.message);
    return null;
  }
};

module.exports = {
  getMeeshoData
};
