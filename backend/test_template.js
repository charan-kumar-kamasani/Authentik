const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://charankumarreddy03_db_user:oTj41t4ATqEVdP25@cluster0.cirqcii.mongodb.net/authentick');
const ProductTemplate = require('./src/models/ProductTemplate');
async function test() {
  const t = await ProductTemplate.findOne({ productName: 'IQOO' }).lean();
  console.log(t);
  process.exit(0);
}
test();
