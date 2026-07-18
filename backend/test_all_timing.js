const { scrapeProductPrice } = require('./src/utils/scraper');

const main = async () => {
  const urls = {
    Amazon: "https://www.amazon.in/Apple-MacBook-Chip-13-inch-256GB/dp/B08N5W4NNB",
    Flipkart: "https://www.flipkart.com/apple-macbook-air-m1-8-gb-256-gb-mac-os-big-sur-mgn63hn-a/p/itmfc87c8562d1da",
    Zepto: "https://www.zeptonow.com/pn/amul-gold-full-cream-fresh-milk/prid/b0b5d9",
    Blinkit: "https://blinkit.com/prn/fortune-sun-lite-refined-sunflower-oil/prid/11105"
  };

  console.log("Measuring response times (simulating API fetch)...\n");

  for (const [platform, url] of Object.entries(urls)) {
    console.time(`⏱️ ${platform} Fetch Time`);
    try {
      const result = await scrapeProductPrice(url);
      console.timeEnd(`⏱️ ${platform} Fetch Time`);
      if (!result) {
        console.log(`   (Failed or blocked by ${platform})`);
      } else {
        console.log(`   (Success - Found Price: ${result.price})`);
      }
    } catch (e) {
      console.timeEnd(`⏱️ ${platform} Fetch Time`);
      console.log(`   (Error fetching ${platform}: ${e.message})`);
    }
    console.log("---");
  }
};
main();
