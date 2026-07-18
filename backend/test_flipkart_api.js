const axios = require('axios');

const main = async () => {
  const url = "https://2.rome.api.flipkart.com/4/user/state";
  const payload = {
    "abDataId": -1,
    "usePrefetch": true,
    "prefetchKey": "userstate",
    "locale": { "deviceLanguage": "en", "shouldRefreshLanguage": false },
    "channelTaggingInfo": {
      "landingPageUrl": "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4",
      "referer": ""
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "x-user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 FKUA/msite/0.0.4/msite/Mobile",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
        "content-type": "application/json",
        "accept": "*/*"
      }
    });

    console.log("API Success!");
    const str = JSON.stringify(response.data);
    if (str.includes("58900")) {
      console.log("Found price 58900 in the API response!");
    } else {
      console.log("Price not found in API response.");
    }
    
    // Let's dump a tiny bit of the response
    console.log(str.substring(0, 300));
  } catch (err) {
    console.error("API failed:", err.message);
  }
};
main();
