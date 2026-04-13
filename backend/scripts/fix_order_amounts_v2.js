const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../src/models/Order');

dotenv.config();

const updateOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all orders that are NOT yet received (finalized)
    const orders = await Order.find({ 
      status: { $ne: 'Received' }
    });

    console.log(`Checking ${orders.length} orders...`);

    let updatedCount = 0;
    for (const order of orders) {
      const calculatedSubtotal = (order.quantity || 0) * (order.pricePerQr || 0);
      
      // If amount is higher than subtotal (meaning it likely includes GST), and it hasn't been paid yet
      if (order.amount > calculatedSubtotal && order.paymentStatus !== 'paid') {
        const oldAmount = order.amount;
        
        // Update both fields to be sure
        order.tax = 0;
        order.subtotal = calculatedSubtotal;
        order.amount = calculatedSubtotal;
        
        await order.save();
        console.log(`Updated Order ${order.orderId}: ₹${oldAmount} -> ₹${order.amount}`);
        updatedCount++;
      }
    }

    console.log(`Update complete. ${updatedCount} orders updated.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

updateOrders();
