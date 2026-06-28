const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('flipkart_test.html', 'utf8');
const $ = cheerio.load(html);
const prices = [];
$('*').each((i, el) => {
  const text = $(el).text().trim();
  if (text.startsWith('₹') && text.length > 2 && text.length < 15 && $(el).children().length === 0) {
    prices.push({ text, class: $(el).attr('class') });
  }
});
console.log(prices.slice(0, 5));
