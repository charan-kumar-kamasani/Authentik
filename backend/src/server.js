// Load environment variables from .env (dotenv)
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const connectDb = require("./config/db");

const app = express();

// Middlewares
app.use(compression()); // Compress all responses
app.use(cors({
  origin: ["https://localhost:5173", "http://localhost:5173", "https://authentiks.in"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Response timing + Redis cache for all GET endpoints
const responseTimeCache = require('./middleware/responseTimeCache');
app.use(responseTimeCache({ cachePrefixes: ['/'], ttlSeconds: 15 }));

// Routes
app.use("/auth", require("./routes/auth.routes"));
app.use("/admin", require("./routes/admin.routes"));
app.use("/scan", require("./routes/scan.routes"));
app.use('/orders', require('./routes/order.routes'));
app.use('/plans', require('./routes/plan.routes'));
app.use('/payments', require('./routes/payment.routes'));
app.use('/dashboard', require('./routes/dashboard.routes'));
app.use('/product-templates', require('./routes/productTemplate.routes'));
app.use('/reviews', require('./routes/review.routes'));
app.use('/leads', require('./routes/lead.routes'));
app.use('/dashboard', require('./routes/dashboard-export.routes'));

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

(async function startServer() {
  try {
    await connectDb();

    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    });

    server.timeout = 600000;

    const { startNotificationCron } = require('./cron/notificationCron');
    startNotificationCron();

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
