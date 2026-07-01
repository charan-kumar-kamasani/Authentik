const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/authentik');
const Brand = require('./backend/src/models/Brand');
const Scan = require('./backend/src/models/Scan');

async function check() {
  const brand = await Brand.findOne({ brandName: 'XYZ' });
  console.log("Brand:", brand);
  process.exit(0);
}
check();
