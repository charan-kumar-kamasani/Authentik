const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const main = async () => {
  const url = "https://www.myntra.com/tshirts/puma/puma-men-black-printed-round-neck-t-shirt/11105932/buy";
  
  console.log("Fetching Myntra URL:", url);
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    console.log("Status:", response.status);
    
    fs.writeFileSync('myntra_test.html', response.data);
    console.log("Saved Myntra HTML to myntra_test.html");
    
    if (response.data.includes('window.__myx =')) {
      console.log('Found window.__myx (JSON state)');
    } else {
      console.log('Did not find window.__myx');
    }
  } catch (error) {
    console.error("Error fetching Myntra:", error.message);
  }
};

main();
