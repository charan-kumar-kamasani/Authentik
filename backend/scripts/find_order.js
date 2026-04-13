const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../src/models/Order');

dotenv.config();

const findOrder = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const order = await Order.findOne({ orderId: 'ORD-1776012070928-72' });
    if (order) {
      console.log('Found Order:', JSON.stringify(order, null, 2));
    } else {
      console.log('Order not found in Order collection.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

findOrder();
