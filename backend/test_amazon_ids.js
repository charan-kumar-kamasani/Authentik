const axios = require('axios');
(async () => {
  try {
    const response = await axios.get('https://www.amazon.in/Optimum-Nutrition-Micronized-Creatine-Powder/dp/B0DBL1T67V', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = response.data;
    
    const parentAsinMatch = html.match(/"parentAsin"\s*:\s*"([^"]+)"/);
    console.log('parentAsin:', parentAsinMatch ? parentAsinMatch[1] : 'Not found');
    
    const productGroupIdMatch = html.match(/"productGroupId"\s*:\s*"([^"]+)"/);
    console.log('productGroupId:', productGroupIdMatch ? productGroupIdMatch[1] : 'Not found');
  } catch (err) {
    console.error(err.message);
  }
})();
