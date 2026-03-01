// Load environment variables from .env (dotenv)
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/auth", require("./routes/auth.routes"));
app.use("/admin", require("./routes/admin.routes"));
app.use("/scan", require("./routes/scan.routes"));
app.use('/orders', require('./routes/order.routes'));
app.use('/plans', require('./routes/plan.routes'));
app.use('/payments', require('./routes/payment.routes'));
app.use('/dashboard', require('./routes/dashboard.routes'));

const PORT = process.env.PORT || 5000;
const HOST = process.env.IP_ADDRESS || "localhost";

(async function startServer() {
  try {
    await connectDb(); // ✅ DB connected first

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1); // ⛔ stop app
  }
})();
