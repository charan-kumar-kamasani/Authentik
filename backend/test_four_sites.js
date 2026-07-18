const axios = require('axios');
const fs = require('fs');

const testSite = async (name, url) => {
  console.log(`\nFetching ${name}: ${url}`);
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000
    });
    console.log(`Status: ${response.status}`);
    fs.writeFileSync(`test_${name.toLowerCase()}.html`, response.data);
    
    const html = response.data;
    if (html.includes('window.__PRELOADED_STATE__')) console.log('Found __PRELOADED_STATE__');
    if (html.includes('__NEXT_DATA__')) console.log('Found __NEXT_DATA__');
    if (html.includes('application/ld+json')) console.log('Found application/ld+json');
    if (html.includes('window.__INITIAL_STATE__')) console.log('Found window.__INITIAL_STATE__');
    
  } catch (error) {
    console.error(`Error fetching ${name}: ${error.message}`);
  }
};

const main = async () => {
  await testSite('Ajio', 'https://www.ajio.com/dnmx-men-mid-rise-slim-fit-jeans/p/441122784_blue');
  await testSite('BigBasket', 'https://www.bigbasket.com/pd/10000159/fresho-potato-1-kg/');
  await testSite('JioMart', 'https://www.jiomart.com/p/groceries/aashirvaad-superior-mp-atta-10-kg/490000035');
  await testSite('FirstCry', 'https://www.firstcry.com/babyhug/babyhug-100-cotton-knit-solid-colour-full-sleeves-t-shirt-mustard/11797864/product-detail');
};

main();
