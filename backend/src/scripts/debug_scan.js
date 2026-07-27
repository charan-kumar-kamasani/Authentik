const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../routes/scan.routes.js');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("DEBUG DYNAMIC FIELDS")) {
  code = code.replace(
    /return res\.json\(\{\n\s*status: "ORIGINAL",/g,
    `console.log("DEBUG DYNAMIC FIELDS BEFORE SEND:", product.dynamicFields);
    return res.json({
      status: "ORIGINAL",`
  );
  fs.writeFileSync(file, code);
  console.log("Injected debug log.");
}
