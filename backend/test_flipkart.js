const axios = require('axios');
const fs = require('fs');

const main = async () => {
  const testUrl = "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4";
  console.log(`Fetching data for: ${testUrl}`);
  
  try {
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });
    
    fs.writeFileSync('flipkart_test.html', response.data);
    console.log("Saved Flipkart HTML to flipkart_test.html");
    
    // Check for common embedded JSON states
    if (response.data.includes('window.__INITIAL_STATE__')) {
      console.log('Found window.__INITIAL_STATE__');
    }
    if (response.data.includes('application/ld+json')) {
      console.log('Found application/ld+json');
    }
    if (response.data.includes('__NEXT_DATA__')) {
      console.log('Found __NEXT_DATA__');
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
};

main();
