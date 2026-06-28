const axios = require('axios');
const fs = require('fs');

(async () => {
  try {
    const res = await axios.get('https://www.flipkart.com/iqoo-neo-10-asphalt-black-256-gb/p/itm4faf25d0485ec', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    fs.writeFileSync('axios_flipkart.html', res.data);
    console.log('Success, saved to axios_flipkart.html');
  } catch(e) {
    console.log('Error:', e.message);
  }
})();
