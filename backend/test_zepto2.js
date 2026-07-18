const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('zepto_test.html', 'utf8');
const $ = cheerio.load(html);

console.log("Extracting application/ld+json blocks...");
$('script[type="application/ld+json"]').each((i, el) => {
  try {
    const jsonStr = $(el).html();
    const data = JSON.parse(jsonStr);
    
    // Check if it's a Product schema
    if (data['@type'] === 'Product' || data['@graph']) {
       console.log(`\n--- JSON Block ${i} ---`);
       console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log("Error parsing JSON:", err.message);
  }
});
