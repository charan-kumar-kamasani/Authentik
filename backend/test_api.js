const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://charankumarreddy03_db_user:oTj41t4ATqEVdP25@cluster0.cirqcii.mongodb.net/authentick');
const Brand = require('./src/models/Brand');
async function run() {
  const brand = await Brand.findById("69cd4340308e647ff73a82ba").populate('companyId').lean();
  console.log("Brand lookup result:", brand);
  process.exit(0);
}
run();
