require('dotenv').config();
const { getBlinkitData } = require('./src/utils/price_scrapers/blinkitScraper');

const main = async () => {
  const url = "https://blinkit.com/prn/ryze-pan-masala-flavoured-nicotine-gum/prid/757415";
  console.log("Checking price for Blinkit URL:", url);
  try {
    const result = await getBlinkitData(url);
    console.log("Result:", result);
  } catch (err) {
    console.log("Error:", err);
  }
};

main();
