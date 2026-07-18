const { getMyntraData } = require('./src/utils/price_scrapers/myntraScraper');

const main = async () => {
  const url = "https://www.myntra.com/sunglasses/salty/salty-women-grey-lens--gold-toned-oval-sunglasses-with/35935136/buy";
  console.log("Checking price for Myntra URL:", url);
  try {
    const result = await getMyntraData(url);
    console.log("Result:", result);
  } catch (err) {
    console.log("Error:", err);
  }
};

main();
