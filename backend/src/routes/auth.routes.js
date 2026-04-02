const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const { sendOTP, verifyOTP } = require("../utils/otpService");

// send OTP to a given mobile number
router.post('/send-otp', async (req, res) => {
  try {
    const { countryCode = '91', mobile } = req.body;
    if (!mobile) return res.status(400).json({ error: 'mobile is required' });

    const result = await sendOTP(countryCode, mobile);
    if (result.success) return res.json(result);
    return res.status(500).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// login with mobile + OTP
router.post('/login', async (req, res) => {
  try {
    const { countryCode = '91', mobile, otp } = req.body;
    if (!mobile || !otp) return res.status(400).json({ error: 'mobile and otp are required' });

    const verification = await verifyOTP(countryCode, mobile, otp);
    if (!verification.success) return res.status(401).json({ error: verification.message || 'Invalid OTP' });

    let user = await User.findOne({ mobile });
    if (!user) user = await User.create({ mobile });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'SECRET');

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get("/profile", protect, async (req, res) => {
  try {
    // req.user is already populated by protect middleware
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put("/profile", protect, async (req, res) => {
  try {
    const { name, ageGroup, dob, gender, country, state, city, profileImage } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, ageGroup, dob, gender, country, state, city, profileImage } },
      { new: true, runValidators: true }
    ).lean();

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
