const { getZeptoData } = require('./src/utils/price_scrapers/zeptoScraper');

const main = async () => {
  const url = "https://www.zepto.com/pn/safewash-top-load-matic-premium-detergent-liquid-2x-stain-removal/pvid/61e37abf-ae16-46ec-8312-b9080e4cbf2e";
  console.log("Checking price for Zepto URL:", url);
  try {
    const result = await getZeptoData(url);
    console.log("Result:", result);
  } catch (err) {
    console.log("Error:", err);
  }
};

main();
