// Load environment variables from .env (dotenv)
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", require("./routes/auth.routes"));
app.use("/admin", require("./routes/admin.routes"));
app.use("/scan", require("./routes/scan.routes"));
app.use('/orders', require('./routes/order.routes'));

const PORT = process.env.PORT || 5000;

(async function startServer() {
  try {
    await connectDb(); // ✅ DB connected first

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1); // ⛔ stop app
  }
})();
