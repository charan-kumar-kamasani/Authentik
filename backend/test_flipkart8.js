const fs = require('fs');
const html = fs.readFileSync('flipkart_on_test.html', 'utf8');

// Find the index of "90,626" or "90626"
const match = /90,626|90626/.exec(html);
if (match) {
  const index = match.index;
  // Log 100 characters before and after to see the JSON or HTML context
  console.log(html.substring(index - 100, index + 100));
}

// Let's also check for rating 4.2
const match2 = /4\.2/.exec(html);
if (match2) {
  const index2 = match2.index;
  console.log("\nRating context:");
  console.log(html.substring(index2 - 100, index2 + 100));
}
