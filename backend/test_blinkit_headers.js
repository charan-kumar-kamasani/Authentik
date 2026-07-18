const axios = require('axios');
const cheerio = require('cheerio');

const main = async () => {
  const url = "https://blinkit.com/prn/ryze-pan-masala-flavoured-nicotine-gum/prid/757415";
  
  console.log("Attempting to spoof headers to bypass WAF...");
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000
    });
    console.log("Status:", response.status);
    console.log("HTML length:", response.data.length);
    if (response.data.includes('__NEXT_DATA__')) {
      console.log("Success! Extracted genuine HTML.");
    } else {
      console.log("Failed: Likely received a WAF challenge page.");
    }
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
       console.error("Response Status:", error.response.status);
    }
  }
};

main();
