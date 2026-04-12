const mongoose = require('mongoose');
require('dotenv').config();
const PricePlan = require('../src/models/PricePlan');
const Feature = require('../src/models/Feature');

async function seedPlans() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Connected to MongoDB');

        // 1. Clear existing plans and features
        await PricePlan.deleteMany({});
        await Feature.deleteMany({});
        console.log('🗑️  Cleared existing plans and features');

        // 2. Create Features
        const featureDocs = [
            { name: "Product Authentication", type: "boolean" },
            { name: "Basic Dashboard", type: "boolean" },
            { name: "Batch Tracking", type: "boolean" },
            { name: "Live Counterfeit Alerts", type: "boolean" },
            { name: "Geo-location Tracking (Map)", type: "boolean" },
            { name: "Detailed Consumer Insights", type: "boolean" },
            { name: "Product & SKU Intelligence", type: "boolean" },
            { name: "API Access (ERP/CRM)", type: "boolean" },
            { name: "Custom Dashboards", type: "boolean" },
            { name: "Advanced Fraud Detection", type: "boolean" }
        ];

        const savedFeatures = await Feature.insertMany(featureDocs);
        console.log(`✅ ${savedFeatures.length} features created`);

        const f = (name) => savedFeatures.find(feat => feat.name === name)?._id;

        // 3. Create Plans
        const plans = [
            {
                name: "Starter",
                description: "Basic protection for emerging brands. Includes essential authentication and tracking.",
                price: 3, // Per QR base (default)
                pricePerQr: 3,
                platformFee: 1000,
                qrCodes: "1,000 / month",
                pricing: {
                    monthly: { platformFee: 1000, pricePerQr: 3, validity: "30" },
                    yearly: { platformFee: 10000, pricePerQr: 2.5, validity: "365", saveText: "2,000" }
                },
                features: [
                    { featureId: f("Product Authentication"), value: true },
                    { featureId: f("Basic Dashboard"), value: true },
                    { featureId: f("Batch Tracking"), value: true },
                    { featureId: f("Live Counterfeit Alerts"), value: false },
                    { featureId: f("Geo-location Tracking (Map)"), value: false }
                ]
            },
            {
                name: "Growth",
                description: "Complete market intelligence and anti-counterfeit suite for growing brands.",
                price: 2,
                pricePerQr: 2,
                platformFee: 5000,
                isPopular: true,
                qrCodes: "5,000 / month",
                pricing: {
                    monthly: { platformFee: 5000, pricePerQr: 2, validity: "30" },
                    yearly: { platformFee: 50000, pricePerQr: 1.5, validity: "365", saveText: "10,000" }
                },
                features: [
                    { featureId: f("Product Authentication"), value: true },
                    { featureId: f("Basic Dashboard"), value: true },
                    { featureId: f("Batch Tracking"), value: true },
                    { featureId: f("Live Counterfeit Alerts"), value: true },
                    { featureId: f("Geo-location Tracking (Map)"), value: true },
                    { featureId: f("Detailed Consumer Insights"), value: true },
                    { featureId: f("Product & SKU Intelligence"), value: true }
                ]
            },
            {
                name: "Enterprise",
                description: "Full API access and custom integrations for high-volume enterprise operations.",
                price: 1,
                pricePerQr: 1,
                platformFee: 10000,
                qrCodes: "10,000 / month",
                pricing: {
                    monthly: { platformFee: 10000, pricePerQr: 1, validity: "30" },
                    yearly: { platformFee: 100000, pricePerQr: 0.8, validity: "365", saveText: "20,000" }
                },
                features: [
                    { featureId: f("Product Authentication"), value: true },
                    { featureId: f("Basic Dashboard"), value: true },
                    { featureId: f("Batch Tracking"), value: true },
                    { featureId: f("Live Counterfeit Alerts"), value: true },
                    { featureId: f("Geo-location Tracking (Map)"), value: true },
                    { featureId: f("Detailed Consumer Insights"), value: true },
                    { featureId: f("Product & SKU Intelligence"), value: true },
                    { featureId: f("API Access (ERP/CRM)"), value: true },
                    { featureId: f("Custom Dashboards"), value: true },
                    { featureId: f("Advanced Fraud Detection"), value: true }
                ]
            }
        ];

        await PricePlan.insertMany(plans);
        console.log('✅ Subscription plans seeded successfully');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedPlans();
