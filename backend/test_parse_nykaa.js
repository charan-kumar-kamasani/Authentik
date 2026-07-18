const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('nykaa_test.html', 'utf-8');
const $ = cheerio.load(html);

// 1. Try to parse JSON-LD
$('script[type="application/ld+json"]').each((i, el) => {
  try {
    const data = JSON.parse($(el).html());
    if (data['@type'] === 'Product') {
      console.log("JSON-LD Price:", data.offers?.price);
      console.log("JSON-LD Rating:", data.aggregateRating?.ratingValue);
      console.log("JSON-LD Reviews:", data.aggregateRating?.reviewCount);
    }
  } catch(e) {}
});

// 2. Try to parse window.__PRELOADED_STATE__
const match = html.match(/window\.__PRELOADED_STATE__\s*=\s*(\{.*?\});?\s*<\/script>/);
if (match) {
  try {
    const state = JSON.parse(match[1]);
    if (state.productPage && state.productPage.product) {
       const p = state.productPage.product;
       console.log("Found product:", p.name);
       console.log("Price:", p.price);
       console.log("MRP:", p.mrp);
       console.log("Discount:", p.discount);
       console.log("Rating:", p.rating);
       console.log("RatingCount:", p.ratingCount);
       console.log("Image:", p.imageUrl);
    }
  } catch(e) {
    console.log("Error parsing PRELOADED_STATE", e.message);
  }
}
