require('dotenv').config();
const mongoose = require('mongoose');
const { runScraper } = require('./src/jobs/priceScraperJob');

const main = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected! Starting runScraper()...');
    
    await runScraper();
    
    console.log('Finished runScraper().');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

main();
