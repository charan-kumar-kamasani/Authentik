const { getNykaaData } = require('./src/utils/price_scrapers/nykaaScraper');

const main = async () => {
  const url = "https://www.nykaa.com/dot-key-dragon-fruit-bounce-sunscreen/p/25781809?productId=25781809&pps=1";
  console.log("Checking price for Nykaa URL:", url);
  console.time('nykaaFetch');
  try {
    const result = await getNykaaData(url);
    console.timeEnd('nykaaFetch');
    console.log("Result:", result);
  } catch (err) {
    console.timeEnd('nykaaFetch');
    console.log("Error:", err);
  }
};

main();
