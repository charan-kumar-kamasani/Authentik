const { getMeeshoData } = require('./src/utils/price_scrapers/meeshoScraper');

const main = async () => {
  const url = "https://www.meesho.com/trendy-attractive-cotton-blend-women-tshirts/p/3547";
  console.log("Checking price for Meesho URL:", url);
  try {
    const result = await getMeeshoData(url);
    console.log("Result:", result);
  } catch (err) {
    console.log("Error:", err);
  }
};

main();
