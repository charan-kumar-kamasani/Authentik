require('dotenv').config();
const { scrapeProductPrice } = require('./src/utils/scraper');

const main = async () => {
  const testUrl = "https://www.amazon.in/EVM-3200MHz-So-DIMM-Laptop-EVMT16G3200S88P/dp/B09XXRD6SF/ref=sr_1_1_sspa?crid=2OKA1Z9HU25K4&dib=eyJ2IjoiMSJ9.9b16wKyIroHUUnuYr0lMOhGaWa4jVld1JpevZ_CkYCK8yL4Vxm8ezexdVh_p79eioCOUdJXHy1WpLCgYNRC0MC9J6Y9uZx5AXUF_T00P-SKXsylV36jbez5ipgwpV-nAcy0faBnrCgqb3EengVtm1zmEHeGX2NpjgiQ7eTijak63fpUB9-y9MFYPQGk9P22O7TqfZ5CTJtJyO2_4fY8Zwdac_PwLQTp3D1AZtWFVLJCILhzgLVgd9Fe-_kR28dyacETqxf65E3I9RDgeNz4E-qFg9qYPFynZcbONTubTo_M.3IiuF6vC99yT9FioneMzLuexe4gCH97b12yOeZtGR24&dib_tag=se&keywords=16gb+ddr4+ram+3200mhz&qid=1784039021&s=electronics&sprefix=16gb%2Celectronics%2C359&sr=1-1-spons&aref=wY4u73FOd5&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1";
  console.log(`Fetching data for: ${testUrl}`);
  
  try {
    const data = await scrapeProductPrice(testUrl);
    console.log("Scrape Result:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
