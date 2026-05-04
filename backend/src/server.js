const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const env = require("./config/env");
const connectDb = require("./config/db");
const { getFirebaseApp } = require("./config/firebase");
const authRoutes = require("./routes/auth");
const businessRoutes = require("./routes/business");
const publicReviewRoutes = require("./routes/publicReview");
const errorHandler = require("./middleware/errorHandler");

getFirebaseApp();

const app = express();

app.set("trust proxy", 1);

// Configure CORS FIRST — must be before DB middleware so iOS Safari
// preflight OPTIONS requests get immediate CORS headers without waiting for DB.
const allowedOrigins = [
  env.frontendUrl,
  "https://review-flow-seven.vercel.app",
  "https://review-flow-git-main-grow-bharat-vyapaars-projects.vercel.app"
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, same-origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 ||
      origin.endsWith(".vercel.app") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight for all routes (fixes iOS Safari)
app.options("*", cors(corsOptions));

// Middleware to ensure DB is connected for serverless environments
app.use(async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (err) {
    console.error("[db] Request-time connection failed:", err.message);
    res.status(500).json({ error: "Database connection failed", details: err.message });
  }
});

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "750kb" }));

app.get("/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    ok: true,
    env: env.nodeEnv,
    db: dbStatus,
    frontend: env.frontendUrl
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/review", publicReviewRoutes);
app.use("/api/webhook", require("./routes/webhook"));
app.use(errorHandler);

if (require.main === module) {
  connectDb()
    .then(() => {
      app.listen(env.port, () => console.log(`[server] Listening on ${env.port}`));
    })
    .catch((error) => {
      console.error("[server] Failed to start", error);
      process.exit(1);
    });
}

// Global error handlers for Vercel logs
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

module.exports = app;
