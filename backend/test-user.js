require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({});
  console.log("User:", user);
  process.exit(0);
}
run();
