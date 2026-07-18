const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('meesho_test.html', 'utf-8');
const $ = cheerio.load(html);

const nextDataText = $('#__NEXT_DATA__').html();
if (nextDataText) {
  try {
    const data = JSON.parse(nextDataText);
    const props = data.props || {};
    const pageProps = props.pageProps || {};
    const initialState = pageProps.initialState || {};
    
    // Find product details
    let productDetails = null;
    
    // Explore the tree
    const explore = (obj, path) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.product_id || (obj.price && obj.mrp) || obj.discounted_price) {
         console.log(`Found product-like data at ${path}:`, obj);
      }
      Object.keys(obj).forEach(key => {
         explore(obj[key], `${path}.${key}`);
      });
    };
    
    explore(initialState, 'initialState');
  } catch(err) {
    console.error(err);
  }
}
