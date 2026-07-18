const axios = require('axios');
const fs = require('fs');

const main = async () => {
  const url = "https://www.flipkart.com/optimum-nutrition-gold-standard-100-whey-protein-powder-2-lbs-micronised-creatine/p/itm99a7adea73fa0?pid=PSLHKQ8T2FYJ4H33&lid=LSTPSLHKQ8T2FYJ4H33I8CBB0&marketplace=FLIPKART&q=Optimum+Nutrition+%28ON%29+RCB+Limited+Edition+Gold+Standard+100%25+Whey+Protein+Powder+Double+Rich&store=hlc%2Fetg%2F1rx&srno=s_1_3&otracker=search&otracker1=search&fm=Search&iid=1959a92a-6eee-4a52-801b-722d3bf7686b.PSLHKQ8T2FYJ4H33.SEARCH&ppt=sp&ppn=sp&qH=a1d2658f35d97041&ov_redirect=true&ov_redirect=true";
  
  const htmlResponse = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 10000
  });
  
  fs.writeFileSync('flipkart_on_test.html', htmlResponse.data);
  console.log("Saved HTML!");
  
  // Quick regex check for rating
  const match = htmlResponse.data.match(/90,?626/g);
  console.log("Found 90,626 occurrences:", match ? match.length : 0);
};

main();
