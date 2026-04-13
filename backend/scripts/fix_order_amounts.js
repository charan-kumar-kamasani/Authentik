const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Order = require('../src/models/Order');

dotenv.config();

const updateOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all orders that are NOT yet received (finalized) and have tax > 0
    const orders = await Order.find({ 
      status: { $ne: 'Received' },
      tax: { $gt: 0 }
    });

    console.log(`Found ${orders.length} orders to update.`);

    for (const order of orders) {
      const oldAmount = order.amount;
      const oldTax = order.tax;
      
      // Remove tax from amount
      order.tax = 0;
      order.amount = order.subtotal; // Since amount = subtotal + tax in this system
      
      await order.save();
      console.log(`Updated Order ${order.orderId}: ₹${oldAmount} (tax ₹${oldTax}) -> ₹${order.amount}`);
    }

    console.log('Update complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

updateOrders();
