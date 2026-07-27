const fs = require('fs');
const content = fs.readFileSync('../routes/scan.routes.js', 'utf8');
const lines = content.split('\n');
let inPostScan = false;
for (let i = 490; i < 1050; i++) {
  if (lines[i] && lines[i].includes('productId: product._id')) {
    console.log('Found at line', i, lines[i]);
  }
}
