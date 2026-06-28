const fs = require('fs');
let code = fs.readFileSync('src/utils/scraper.js', 'utf8');

const flipkartUpdate = `
    // Try old classes first
    let priceText = $('._30jeq3').first().text().trim() || $('.Nx9bqj').first().text().trim();
    
    // Fallback for Mobile Web / React Native Web (dl.flipkart.com)
    if (!priceText) {
      const prices = [];
      $('*').each((i, el) => {
        const text = $(el).text().trim();
        if (text.startsWith('₹') && text.length > 2 && text.length < 15 && $(el).children().length === 0) {
          prices.push(text);
        }
      });
      if (prices.length > 1) {
        // Usually [MRP, Sale Price, EMI, Discount] or [Sale Price, MRP, Discount]
        // Let's just pick the smallest of the first two as the price, largest as MRP
        const p1 = parseFloat(prices[0].replace(/[^0-9.]/g, ''));
        const p2 = parseFloat(prices[1].replace(/[^0-9.]/g, ''));
        if (p1 && p2) {
          result.price = Math.min(p1, p2);
          result.mrp = Math.max(p1, p2);
          priceText = result.price.toString(); // to bypass old parsing below
        } else if (p1) {
          result.price = p1;
        }
      } else if (prices.length === 1) {
        result.price = parseFloat(prices[0].replace(/[^0-9.]/g, ''));
      }
    }
    
    if (priceText && !result.price) {
      result.price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    }
`;

code = code.replace(/let priceText = \$\('._30jeq3'\)[\s\S]*?result\.price = parseFloat\(priceText\.replace\(\/\[\^0-9\.\]\/g, ''\)\);\n    }/, flipkartUpdate);

fs.writeFileSync('src/utils/scraper.js', code);
