require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const ProductTemplate = require('../models/ProductTemplate');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const product = await Product.findOne({ qrCode: 'SA-0000000005005-QYEE' }).lean();
    if (!product) {
       console.log("Product not found");
       process.exit(0);
    }
    console.log("=== PRODUCT ===");
    console.log(product);
    let templateId = product.templateId;
    if (!templateId && product.orderId) {
       const order = await mongoose.model('Order').findById(product.orderId);
       if (order) templateId = order.templateId;
    }
    
    let template = null;
    if (templateId) {
       template = await ProductTemplate.findById(templateId).lean();
    } else {
       template = await ProductTemplate.findOne({ productName: product.productName, brandId: product.brandId }).lean();
    }
    
    console.log("=== TEMPLATE ===");
    console.log(template);
    process.exit(0);
  });
