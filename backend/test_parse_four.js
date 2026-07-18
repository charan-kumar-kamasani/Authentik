const fs = require('fs');
const cheerio = require('cheerio');

const parseJioMart = () => {
  const html = fs.readFileSync('test_jiomart.html', 'utf-8');
  const $ = cheerio.load(html);
  
  const price = $('#price').text() || $('.jm-heading-s').first().text();
  const mrp = $('#mrp').text() || $('.jm-body-s-bold').text();
  console.log("JioMart DOM Price:", price.trim());
  console.log("JioMart DOM MRP:", mrp.trim());
  
  const ldJson = $('script[type="application/ld+json"]').html();
  if (ldJson) console.log("JioMart LD JSON exists!");
  
  const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\})/);
  if (stateMatch) console.log("JioMart Initial State exists!");
};

const parseFirstCry = () => {
  const html = fs.readFileSync('test_firstcry.html', 'utf-8');
  const $ = cheerio.load(html);
  
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const data = JSON.parse($(el).html());
      if (data['@type'] === 'Product') {
        console.log("FirstCry JSON-LD Price:", data.offers?.price);
      }
    } catch(e){}
  });
};

parseJioMart();
parseFirstCry();
