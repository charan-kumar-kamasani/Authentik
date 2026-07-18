const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('zepto_test.html', 'utf8');
const $ = cheerio.load(html);

console.log("Price:", $('[itemProp="price"]').attr('content'));
console.log("Rating:", $('[itemProp="ratingValue"]').attr('content') || $('[itemProp="ratingValue"]').text());
console.log("Reviews:", $('[itemProp="reviewCount"]').attr('content') || $('[itemProp="reviewCount"]').text());

// Let's also search the whole HTML for the number 1039 (which is the MRP of this ON creatine product)
const mrpMatch = html.match(/1,?039/g);
console.log("Found MRP 1039:", mrpMatch ? mrpMatch.length : 0);

// Print the context of where 1039 appears
if (mrpMatch) {
   const idx = html.indexOf('1039');
   console.log("Context of MRP:", html.substring(idx - 100, idx + 100));
}
