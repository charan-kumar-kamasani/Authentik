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
      timeout: 15000
    });
    console.log(`Status: ${response.status}`);
    
    const html = response.data;
    if (html.includes('window.__PRELOADED_STATE__')) console.log('Found __PRELOADED_STATE__');
    if (html.includes('__NEXT_DATA__')) console.log('Found __NEXT_DATA__');
    if (html.includes('application/ld+json')) console.log('Found application/ld+json');
    if (html.includes('window.__INITIAL_STATE__')) console.log('Found window.__INITIAL_STATE__');
    if (html.includes('window.APP_INITIAL_STATE')) console.log('Found window.APP_INITIAL_STATE');
    if (html.includes('window.__NUXT__')) console.log('Found window.__NUXT__');
    
  } catch (error) {
    if (error.response) {
      console.error(`Error fetching ${name}: Status ${error.response.status}`);
    } else {
      console.error(`Error fetching ${name}: ${error.message}`);
    }
  }
};

const main = async () => {
  await testSite('Purplle', 'https://www.purplle.com/product/good-vibes-tea-tree-face-wash');
  await testSite('Tata CLiQ', 'https://www.tatacliq.com/tata-cliq-men-white-solid-casual-shirt/p-mp0000000097');
  await testSite('Snapdeal', 'https://www.snapdeal.com/product/bhagat-mens-black-synthetic-leather/649774574928');
  await testSite('PharmEasy', 'https://pharmeasy.in/health-care/products/volini-pain-relief-gel-tube-of-30-g-152');
  await testSite('Apollo 24/7', 'https://www.apollopharmacy.in/otc/vicks-vaporub-25-ml');
  await testSite('Croma', 'https://www.croma.com/apple-iphone-13-128gb-rom-4gb-ram-starlight-white-/p/243459');
  await testSite('Reliance Digital', 'https://www.reliancedigital.in/apple-iphone-13-128-gb-starlight/p/491997699');
  await testSite('Pepperfry', 'https://www.pepperfry.com/product/mint-solid-wood-queen-size-bed-in-honey-oak-finish-by-woodsworth-1736796.html');
};

main();
