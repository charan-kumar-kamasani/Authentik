const fs = require('fs');
const html = fs.readFileSync('flipkart_on_test.html', 'utf8');

const match = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});\s*<\/script>/);
if (match) {
  const state = JSON.parse(match[1]);
  
  const findRating = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(k => {
      if (k.toLowerCase().includes('rating') || k.toLowerCase().includes('review')) {
        // limit output size
        const valStr = JSON.stringify(obj[k]);
        if (valStr && valStr.length < 200) {
           console.log("Found key:", k, "=>", valStr);
        }
      }
    });

    Object.values(obj).forEach(val => findRating(val));
  };
  
  findRating(state);
}
