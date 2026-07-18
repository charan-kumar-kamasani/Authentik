const fs = require('fs');
const state = JSON.parse(fs.readFileSync('flipkart_state.json', 'utf8'));

let mrp = null;
let rating = null;
let reviews = null;

const findData = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  
  if (obj.pricing && obj.pricing.mrp) {
     mrp = obj.pricing.mrp;
  }
  if (obj.rating && obj.rating.average) {
     rating = obj.rating.average;
  }
  if (obj.rating && obj.rating.count) {
     reviews = obj.rating.count;
  }
  
  Object.values(obj).forEach(val => findData(val));
};

findData(state);
console.log("Extracted MRP:", mrp);
console.log("Extracted Rating:", rating);
console.log("Extracted Reviews:", reviews);
