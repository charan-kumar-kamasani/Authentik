const fs = require('fs');

const html = fs.readFileSync('nykaa_test.html', 'utf-8');
const match = html.match(/window\.__PRELOADED_STATE__\s*=\s*(\{.*?\});?\s*<\/script>/);

if (match) {
  const state = JSON.parse(match[1]);
  let paths = [];

  const search = (obj, currentPath) => {
    if (!obj) return;
    if (typeof obj === 'string' && (obj.includes('699') || obj.includes('1067208'))) {
       paths.push(`${currentPath} = ${obj}`);
    } else if (typeof obj === 'number' && (obj === 699 || obj === 664 || obj === 1067208)) {
       paths.push(`${currentPath} = ${obj}`);
    } else if (typeof obj === 'object') {
       for (const key in obj) {
          search(obj[key], `${currentPath}.${key}`);
       }
    }
  };

  search(state, 'state');
  console.log("Found matches at:", paths.slice(0, 20));
}
