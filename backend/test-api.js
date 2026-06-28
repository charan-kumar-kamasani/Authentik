const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '/Users/charankumarkamasani/Projects/authentik/backend/.env' });

const token = jwt.sign({ id: '69f208b18dfa1464d6c2587b' }, process.env.JWT_SECRET, { expiresIn: '30d' });

const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://localhost:5000/scan', {
      qrCode: "SA-0000000003001-VEF3",
      userId: "69f208b18dfa1464d6c2587b",
      latitude: 13.0849584,
      longitude: 80.2759873,
      place: "Chennai"
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("RESPONSE DATA:");
    console.log(JSON.stringify(res.data.data.orderLinks, null, 2));
    console.log("description:", res.data.data.description);
    console.log("keyBenefits:", res.data.data.keyBenefits);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
