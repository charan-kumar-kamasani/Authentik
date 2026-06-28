const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
require('./src/models/Company');
require('./src/models/Brand');
require('./src/models/Order');
const Product = require('./src/models/Product');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const qrCode = "SA-0000000003001-VEF3";
  let product = await Product.findOne({ qrCode })
      .populate('orderId')
      .populate({
        path: 'brandId',
        populate: { path: 'companyId' }
      })
      .lean();

  if (!product) return console.log("Product not found");

  const brandIdFromPrefix = null;
  const finalBrandId = product.brandId?._id || product.brandId || brandIdFromPrefix;
  console.log("finalBrandId:", finalBrandId);
  
  const matchBrandId = mongoose.isValidObjectId(finalBrandId) 
          ? new mongoose.Types.ObjectId(finalBrandId) 
          : finalBrandId;

  console.log("matchBrandId:", matchBrandId);
  console.log("product.productName:", product.productName);

  let templateData = { orderLinks: [] };

  if (product.productName) {
      const ProductTemplate = require("./src/models/ProductTemplate");
      const template = await ProductTemplate.findOne({ 
             productName: product.productName,
             brandId: matchBrandId,
             status: 'active'
      }).lean();

      if (template) {
          templateData.orderLinks = template.orderLinks || [];
          console.log("Found template!", templateData.orderLinks.length, "links");
      } else {
          console.log("Template not found for criteria!");
      }
  }

  const finalOrderLinks = (product.orderLinks && product.orderLinks.length > 0) ? product.orderLinks : templateData.orderLinks;
  console.log("finalOrderLinks:", finalOrderLinks);

  process.exit(0);
}
run();
