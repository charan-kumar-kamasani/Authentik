const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('flipkart_test.html', 'utf8');
const $ = cheerio.load(html);

const ldJsons = [];
$('script[type="application/ld+json"]').each((i, el) => {
  try {
    ldJsons.push(JSON.parse($(el).html()));
  } catch(e) {}
});

console.log(JSON.stringify(ldJsons, null, 2));
