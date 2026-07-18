const axios = require('axios');
(async () => {
  try {
    const response = await axios.get('https://www.amazon.in/Optimum-Nutrition-Micronized-Creatine-Powder/dp/B0DBL1T67V', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = response.data;
    
    const match = html.match(/var\s+obj\s*=\s*jQuery\.parseJSON\('([^']+)'\)/);
    if (match) {
        // Amazon escapes JSON inside parseJSON, unescape it
        const jsonStr = match[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
        const fs = require('fs');
        fs.writeFileSync('amazon_embedded.json', jsonStr);
        console.log('Saved to amazon_embedded.json');
    }
  } catch (err) {}
})();
