const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://charankumarreddy03_db_user:oTj41t4ATqEVdP25@cluster0.cirqcii.mongodb.net/authentick');
const Product = require('./src/models/Product');

async function run() {
  const p = await Product.findOne({ productName: /IQOO/i });
  console.log("Product:", p);
  process.exit(0);
}
run();
