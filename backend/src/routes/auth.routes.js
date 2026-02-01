const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { mobile, otp } = req.body;

  if (otp !== "123456") return res.status(401).json({ error: "Invalid OTP" });

  let user = await User.findOne({ mobile });
  if (!user) user = await User.create({ mobile });

  const token = jwt.sign({ userId: user._id }, "SECRET");

  res.json({ token });
});

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put("/profile", protect, async (req, res) => {
  try {
    const { name, dob, gender, country, state, city } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    if (country) user.country = country;
    if (state) user.state = state;
    if (city) user.city = city;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
