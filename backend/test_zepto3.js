const fs = require('fs');
const html = fs.readFileSync('zepto_test.html', 'utf8');

const idIndex = html.indexOf('701b165f-9f9d-4c67-adbd-0b8827c38068');
if (idIndex !== -1) {
   console.log("Context around ID:");
   console.log(html.substring(idIndex - 100, idIndex + 200));
}

const priceIndex = html.indexOf('"price"');
if (priceIndex !== -1) {
   console.log("\nContext around 'price':");
   console.log(html.substring(priceIndex - 100, priceIndex + 200));
}
