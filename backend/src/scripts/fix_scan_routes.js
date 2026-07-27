const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../routes/scan.routes.js');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/product\.dynamicFields\.size > 0/g, "Object.keys(product.dynamicFields).length > 0");
code = code.replace(/product\.orderId\.dynamicFields\.size > 0/g, "Object.keys(product.orderId.dynamicFields).length > 0");
code = code.replace(/product\.orderId\?\.dynamicFields\.size > 0/g, "Object.keys(product.orderId?.dynamicFields || {}).length > 0");
code = code.replace(/product\.orderId\?\.dynamicFields && product\.orderId\.dynamicFields/g, "product.orderId?.dynamicFields");

fs.writeFileSync(file, code);
console.log("Done");
