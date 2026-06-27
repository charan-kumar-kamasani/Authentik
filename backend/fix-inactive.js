const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

async function fixProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/authentik');
    console.log('Connected to MongoDB');

    const result = await Product.updateMany({ isActive: false }, { $set: { isActive: true } });
    console.log(`Updated ${result.modifiedCount} products to be active.`);
    
    // Set all Completed orders to Received
    const orderResult = await Order.updateMany({ status: 'Completed' }, { $set: { status: 'Received' } });
    console.log(`Updated ${orderResult.modifiedCount} orders to Received.`);

    mongoose.disconnect();
  } catch (error) {
    console.error(error);
    mongoose.disconnect();
  }
}

fixProducts();
