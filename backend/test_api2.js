const http = require('http');

http.get('http://localhost:5000/api/scan/brand/69cd4340308e647ff73a82b8', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log("Brand response:", data));
});

http.get('http://localhost:5000/api/scan/recommendations/69cd4340308e647ff73a82b8', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log("Recommendations response:", data));
});
