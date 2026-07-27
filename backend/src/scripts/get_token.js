require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const User = require('../models/User');
    const user = await User.findOne({}).lean();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log(token);
    process.exit(0);
  });
