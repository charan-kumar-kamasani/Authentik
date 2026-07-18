require('dotenv').config();
const { scrapeProductPrice } = require('./src/utils/scraper');

const main = async () => {
  const testUrl = "https://www.flipkart.com/kenstar-black-pureza-8-l-ro-uv-uf-copper-alkaline-minerals-water-purifier-needs-no-service-2-years/p/itm123f0d1974f36?pid=WAPHBA97RGPHMG26&lid=LSTWAPHBA97RGPHMG26W1HS33&marketplace=FLIPKART&q=kenstar+water+purifier&store=j9e%2Fabm%2Fi45&srno=s_1_2&otracker=AS_QueryStore_HistoryAutoSuggest_1_4_na_na_na&otracker1=AS_QueryStore_HistoryAutoSuggest_1_4_na_na_na&fm=organic&iid=en_boJRdEY2RHoVJEezAXVQS12wIbukzHvxS8QFnLxCygPRgECdbciQwl3Q8qQvvHBRy7Sx_4SqRlXBnwo7IYBNyA1NDOdsE91LwfNXYc3h7f3fkyxeta-UQTTydycX84zB&ppt=None&ppn=None&ssid=pnok8oq8sg0000001784040520315&qH=2cf032a4c81355ee&ov_redirect=true";
  console.log(`Fetching data for: ${testUrl}`);
  
  try {
    const data = await scrapeProductPrice(testUrl);
    console.log("Scrape Result:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
