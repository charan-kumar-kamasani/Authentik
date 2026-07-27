const fs = require('fs');
const content = fs.readFileSync('../routes/scan.routes.js', 'utf8');
const lines = content.split('\n');
for (let i = 980; i < 1000; i++) {
  console.log(lines[i]);
}
