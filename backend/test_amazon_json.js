const axios = require('axios');
(async () => {
  try {
    const response = await axios.get('https://www.amazon.in/Optimum-Nutrition-Micronized-Creatine-Powder/dp/B0DBL1T67V', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = response.data;
    
    // Let's look for twister or setup objects
    const match = html.match(/var\s+obj\s*=\s*jQuery\.parseJSON\('([^']+)'\)/);
    if (match) {
        console.log('Found jQuery.parseJSON');
    } else {
        const match2 = html.match(/dataToReturn\s*=\s*(\{.*?\});/);
        if (match2) {
            console.log('Found dataToReturn');
        } else {
            console.log('Looking for 925 in script tags...');
            const cheerio = require('cheerio');
            const $ = cheerio.load(html);
            $('script').each((i, el) => {
                const text = $(el).html() || '';
                if (text.includes('925')) {
                    console.log('Script snippet:', text.substring(0, 100) + '...');
                }
            });
        }
    }
  } catch (err) {
    console.error(err.message);
  }
})();
