const fs = require('fs');
const state = JSON.parse(fs.readFileSync('flipkart_state.json', 'utf8'));
let foundPrices = [];

// Recursive search for 'price' or 'pricing' in the giant state object
const findPricing = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  if (obj.pricing && obj.pricing.finalPrice) {
    foundPrices.push(obj.pricing);
  }
  if (obj.prices && obj.prices.price) {
    foundPrices.push(obj.prices);
  }
  Object.values(obj).forEach(val => findPricing(val));
};

findPricing(state);
console.log('Found Pricing nodes:', JSON.stringify(foundPrices.slice(0, 3), null, 2));
