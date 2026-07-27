const fs = require('fs');
const content = fs.readFileSync('../routes/scan.routes.js', 'utf8');
const lines = content.split('\n');
for (let i = 640; i < 665; i++) {
  console.log(lines[i]);
}
