const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://charankumarreddy03_db_user:oTj41t4ATqEVdP25@cluster0.cirqcii.mongodb.net/authentick');
const ProductTemplate = require('./src/models/ProductTemplate');
const Brand = require('./src/models/Brand');
const Company = require('./src/models/Company');

async function run() {
  const p = await ProductTemplate.findOne({ productName: /IQOO/i });
  console.log("Product:", p);
  if(p && p.brandId) {
    const b = await Brand.findById(p.brandId);
    console.log("Brand by p.brandId:", b);
  }
  if(p && p.companyId) {
    const c = await Company.findById(p.companyId);
    console.log("Company by p.companyId:", c);
  }
  process.exit(0);
}
run();
