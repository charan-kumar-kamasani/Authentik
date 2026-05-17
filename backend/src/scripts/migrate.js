require('dotenv').config();
const mongoose = require('mongoose');
const connectDb = require('../config/db');
const WarrantyClaim = require('../models/WarrantyClaim');

async function run() {
  await connectDb();
  console.log('Running migration: Sent -> Registered...');
  const res = await WarrantyClaim.updateMany({ status: 'Sent' }, { $set: { status: 'Registered' } });
  console.log(`Updated ${res.modifiedCount} claims.`);
  mongoose.connection.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
