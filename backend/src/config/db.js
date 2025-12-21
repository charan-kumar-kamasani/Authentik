const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://charankumarreddy03_db_user:oTj41t4ATqEVdP25@cluster0.cirqcii.mongodb.net/authentick";

async function connectDb() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
}

module.exports = connectDb;
