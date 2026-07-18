const fs = require('fs');
const state = JSON.parse(fs.readFileSync('flipkart_state.json', 'utf8'));

let price = null;
let mrp = null;

// The JSON state is usually keyed by module ID. 
// Easiest is to traverse and find pricing.finalPrice or pricing.displayPrice
const findPricing = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  
  if (obj.pricing && obj.pricing.finalPrice && obj.pricing.finalPrice.value) {
    if (!price) price = obj.pricing.finalPrice.value;
  }
  
  if (obj.pricing && obj.pricing.displayPrice) {
     if (!price) price = obj.pricing.displayPrice;
  }

  if (obj.prices && obj.prices.price) {
     if (!price) price = obj.prices.price;
  }

  // schema.org offer
  if (obj['@type'] === 'Offer' && obj.price) {
    if (!price) price = obj.price;
  }
  
  Object.values(obj).forEach(val => findPricing(val));
};

findPricing(state);
console.log("Extracted Price:", price);
