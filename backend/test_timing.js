const { scrapeProductPrice } = require('./src/utils/scraper');

const main = async () => {
  const url = "https://www.flipkart.com/kenstar-black-pureza-8-l-ro-uv-uf-copper-alkaline-minerals-water-purifier-needs-no-service-2-years/p/itm123f0d1974f36";
  console.time("⏱️ Flipkart Fetch Time");
  await scrapeProductPrice(url);
  console.timeEnd("⏱️ Flipkart Fetch Time");
};
main();
