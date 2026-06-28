const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const Product = require('./src/models/Product');
const ProductTemplate = require('./src/models/ProductTemplate');
require('./src/models/Order');
require('./src/models/Brand');
require('./src/models/Company');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const qrCode = 'SA-0000000003001-VEF3'; // From the user's log
  
  const product = await Product.findOne({ qrCode })
      .populate('orderId')
      .populate({ path: 'brandId', populate: { path: 'companyId' } })
      .lean();
      
  if (!product) {
    console.log("Product not found");
    return process.exit(0);
  }
  
  const finalBrandId = product.brandId?._id || product.brandId;
  const matchBrandId = mongoose.isValidObjectId(finalBrandId) 
          ? new mongoose.Types.ObjectId(finalBrandId) 
          : finalBrandId;

  console.log("product.productName:", product.productName);
  console.log("finalBrandId:", finalBrandId);
  console.log("matchBrandId:", matchBrandId);
  
  const template = await ProductTemplate.findOne({ 
             productName: product.productName,
             brandId: matchBrandId,
             status: 'active'
           }).lean();
           
  console.log("Found Template?", !!template);
  if (template) {
    console.log("template.productImage:", template.productImage);
  }
  process.exit(0);
}
run();
