const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

let browserInstance = null;

const getBrowser = async () => {
  if (!browserInstance) {
    console.log('Launching persistent background browser...');
    browserInstance = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browserInstance;
};

// Optional: Gracefully close browser when Node process exits
process.on('exit', () => {
  if (browserInstance) {
    browserInstance.close();
  }
});
process.on('SIGINT', async () => {
  if (browserInstance) {
    await browserInstance.close();
  }
  process.exit(0);
});

module.exports = { getBrowser };
