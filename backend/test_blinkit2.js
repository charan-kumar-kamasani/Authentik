const axios = require('axios');
const fs = require('fs');

const main = async () => {
  const url = "https://blinkit.com/pr/amul-gold-full-cream-fresh-milk/13600";
  
  try {
    const htmlResponse = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000
    });
    
    fs.writeFileSync('blinkit_test.html', htmlResponse.data);
    console.log("Saved Blinkit HTML to blinkit_test.html");
    
    if (htmlResponse.data.includes('__NEXT_DATA__')) console.log('Found __NEXT_DATA__');

  } catch (error) {
    console.error("Error fetching Blinkit:", error.message);
  }
};

main();
