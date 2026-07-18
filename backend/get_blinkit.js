const axios = require('axios');
const cheerio = require('cheerio');

const search = async () => {
  const url = "https://lite.duckduckgo.com/lite/";
  const response = await axios.post(url, 'q=site:blinkit.com/pr/ optimum nutrition', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  const $ = cheerio.load(response.data);
  $('a.result-url').each((i, el) => {
    console.log($(el).attr('href'));
  });
};
search();
