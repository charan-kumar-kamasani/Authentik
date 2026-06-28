const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({});
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

  console.log("Sending request...");
  try {
    const res = await axios.post('http://localhost:5000/scan', {
      qrCode: "SA-0000000003001-VEF3",
      userId: user._id.toString(),
      latitude: 13.0849584,
      longitude: 80.2759873,
      place: "Chennai"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Got response:", res.status);
    console.log("orderLinks:", res.data.data.orderLinks);
  } catch (err) {
    if (err.response) {
       console.log("Status:", err.response.status);
       console.log("Data:", err.response.data);
    } else {
       console.log("Error:", err.message);
    }
  }
  process.exit(0);
}
run();
