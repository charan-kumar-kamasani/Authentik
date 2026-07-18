const axios = require('axios');
(async () => {
  try {
    const scrapeDoToken = '8844c032b3cb4053bc2dfd4e4aa91e97f8bbd793687'; // from earlier
    const targetUrl = 'https://www.amazon.in/gp/product/ajax/twisterDimensionSlotsDefault?isDimensionSlotsAjax=1&asin=B0DBL1T67V';
    const proxyUrl = `https://api.scrape.do/?token=${scrapeDoToken}&url=${encodeURIComponent(targetUrl)}`;
    
    console.log('Fetching Twister API via scrape.do...');
    const response = await axios.get(proxyUrl);
    console.log('Response:', JSON.stringify(response.data).substring(0, 300));
  } catch (err) {
    console.error(err.message);
  }
})();
