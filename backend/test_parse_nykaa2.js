const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('nykaa_test.html', 'utf-8');
const $ = cheerio.load(html);

$('script[type="application/ld+json"]').each((i, el) => {
  try {
    const data = JSON.parse($(el).html());
    console.log("Found JSON-LD Type:", data['@type']);
    if (data['@type'] === 'Product') {
      console.log("JSON-LD Price:", data.offers?.price);
      console.log("JSON-LD Rating:", data.aggregateRating?.ratingValue);
      console.log("JSON-LD Reviews:", data.aggregateRating?.reviewCount);
      console.log("JSON-LD Image:", data.image);
    }
  } catch(e) {}
});

// Let's also check standard meta tags
console.log("Meta og:title:", $('meta[property="og:title"]').attr('content'));
console.log("Meta price:", $('meta[property="product:price:amount"]').attr('content'));
console.log("Meta image:", $('meta[property="og:image"]').attr('content'));
