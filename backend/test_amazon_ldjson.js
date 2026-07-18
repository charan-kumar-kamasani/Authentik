const axios = require('axios');
const cheerio = require('cheerio');
(async () => {
  try {
    const response = await axios.get('https://www.amazon.in/Optimum-Nutrition-Micronized-Creatine-Powder/dp/B0DBL1T67V', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(response.data);
    let found = false;
    $('script[type="application/ld+json"]').each((i, el) => {
      const text = $(el).html();
      console.log('JSON-LD found:', text);
      found = true;
    });
    if (!found) console.log('No JSON-LD found');
  } catch (err) {}
})();
