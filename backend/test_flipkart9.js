const fs = require('fs');
const html = fs.readFileSync('flipkart_on_test.html', 'utf8');

const match = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});\s*<\/script>/);
if (match) {
  const state = JSON.parse(match[1]);
  let rating = null;
  let count = null;
  
  const findRating = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    if (obj.rating && obj.rating.average) rating = obj.rating.average;
    if (obj.rating && obj.rating.count) count = obj.rating.count;
    
    if (obj.rating && obj.rating.value) rating = obj.rating.value;
    if (obj.reviewCount) count = obj.reviewCount;
    if (obj.ratingCount) count = obj.ratingCount;
    
    Object.keys(obj).forEach(k => {
      // Look for any key containing rating or review
      if (k.toLowerCase().includes('rating') || k.toLowerCase().includes('review')) {
        // console.log("Found key:", k, obj[k]);
      }
    });

    Object.values(obj).forEach(val => findRating(val));
  };
  
  findRating(state);
  console.log("Rating:", rating);
  console.log("Count:", count);
}
