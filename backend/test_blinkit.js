const axios = require('axios');
const fs = require('fs');

const main = async () => {
  // Common Blinkit product URL format
  const url = "https://blinkit.com/pr/amul-gold-full-cream-fresh-milk/13600";
  
  try {
    const htmlResponse = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000
    });
    
    fs.writeFileSync('blinkit_test.html', htmlResponse.data);
    console.log("Saved Blinkit HTML to blinkit_test.html");
    
    if (htmlResponse.data.includes('__NEXT_DATA__')) console.log('Found __NEXT_DATA__');
    if (htmlResponse.data.includes('window.__INITIAL_STATE__')) console.log('Found window.__INITIAL_STATE__');
    if (htmlResponse.data.includes('application/ld+json')) console.log('Found application/ld+json');
    if (htmlResponse.data.includes('price')) console.log('Found the word "price" in HTML');

  } catch (error) {
    console.error("Error fetching Blinkit:", error.message);
  }
};

main();
