const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { mobile, otp } = req.body;

  if (otp !== "123456") return res.status(401).json({ error: "Invalid OTP" });

  let user = await User.findOne({ mobile });
  if (!user) user = await User.create({ mobile });

  const token = jwt.sign({ userId: user._id }, "SECRET");

  res.json({ token });
});

module.exports = router;
