const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const main = async () => {
  const url = "https://blinkit.com/prn/ryze-pan-masala-flavoured-nicotine-gum/prid/757415";
  console.log("Starting Puppeteer for Blinkit:", url);
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    // Some stealth tactics
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9'
    });
    
    console.log("Navigating...");
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log("Status:", response.status());
    
    if (response.status() === 403) {
      console.log("Still getting 403 with Puppeteer stealth.");
    } else {
      const html = await page.content();
      console.log("Success! HTML Length:", html.length);
      const fs = require('fs');
      fs.writeFileSync('puppeteer_blinkit.html', html);
      console.log("Saved to puppeteer_blinkit.html");
    }
  } catch (err) {
    console.error("Puppeteer error:", err.message);
  } finally {
    await browser.close();
  }
};

main();
