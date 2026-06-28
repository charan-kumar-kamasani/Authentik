const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const Scan = require('./src/models/Scan');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const scan = await Scan.findOne().sort({ createdAt: -1 }).lean();
  console.log("Latest scan:");
  console.log("createdAt:", scan.createdAt);
  console.log("qrCode:", scan.qrCode);
  console.log("status:", scan.status);
  process.exit(0);
}
run();
