const fs = require('fs');

const html = fs.readFileSync('myntra_test.html', 'utf-8');
const match = html.match(/window\.__myx\s*=\s*(\{.*?\})<\/script>/);

if (match) {
  try {
    const state = JSON.parse(match[1]);
    const pdpData = state.pdpData || {};
    
    let price = null;
    let mrp = null;
    let discount = null;
    let rating = null;
    let reviewsCount = null;
    let siteImage = null;
    
    if (pdpData.price) {
      price = pdpData.price.discounted || pdpData.price.mrp;
      mrp = pdpData.price.mrp;
    }
    
    if (pdpData.ratings) {
        rating = pdpData.ratings.averageRating;
        reviewsCount = pdpData.ratings.totalCount;
    }
    
    if (pdpData.media && pdpData.media.albums && pdpData.media.albums.length > 0) {
        const defaultAlbum = pdpData.media.albums.find(a => a.name === 'default') || pdpData.media.albums[0];
        if (defaultAlbum && defaultAlbum.images && defaultAlbum.images.length > 0) {
            siteImage = defaultAlbum.images[0].src;
        }
    }
    
    console.log("Keys:", Object.keys(pdpData));
    if (pdpData.ratings) console.log("Ratings:", pdpData.ratings);
    // Also check for reviewData or similar
  } catch (err) {
    console.error("Parse error:", err);
  }
} else {
  console.log("No match found for __myx");
}
