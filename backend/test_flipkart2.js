const fs = require('fs');

const html = fs.readFileSync('flipkart_test.html', 'utf8');

const match = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});\s*<\/script>/);
if (match) {
  fs.writeFileSync('flipkart_state.json', match[1]);
  console.log('Saved window.__INITIAL_STATE__ to flipkart_state.json');
} else {
  console.log('Could not extract __INITIAL_STATE__');
}
