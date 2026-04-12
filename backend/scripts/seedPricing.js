const mongoose = require('mongoose');
require('dotenv').config();
const BillingConfig = require('../src/models/BillingConfig');

async function seedPricing() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Connected to MongoDB');

        let config = await BillingConfig.getConfig();
        
        config.qrPricingBrackets = [
            { minQuantity: 500, maxQuantity: 5000, pricePerQr: 3 },
            { minQuantity: 5001, maxQuantity: 50000, pricePerQr: 2 },
            { minQuantity: 50001, maxQuantity: null, pricePerQr: 1 }
        ];

        await config.save();
        console.log('✅ Pricing brackets seeded successfully');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedPricing();
