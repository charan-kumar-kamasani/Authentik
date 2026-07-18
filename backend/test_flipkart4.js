const fs = require('fs');
const state = JSON.parse(fs.readFileSync('flipkart_state.json', 'utf8'));
let found = [];

const findPrice = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  
  if (obj.pricing && obj.pricing.displayPrice) {
    found.push(obj.pricing);
  } else if (obj.price && typeof obj.price === 'number') {
    found.push(obj);
  } else if (obj.finalPrice && typeof obj.finalPrice.value === 'number') {
    found.push(obj.finalPrice);
  }
  
  Object.values(obj).forEach(val => findPrice(val));
};

findPrice(state);
console.log('Found:', JSON.stringify(found.slice(0, 5), null, 2));
