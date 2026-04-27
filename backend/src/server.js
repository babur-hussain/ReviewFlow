const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
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

// Configure CORS first to ensure headers are always present
const allowedOrigins = [
  env.frontendUrl,
  "https://review-flow-seven.vercel.app",
  "https://review-flow-git-main-grow-bharat-vyapaars-projects.vercel.app"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

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
} else {
  // On Vercel, we still need to connect to the DB
  connectDb();
}

module.exports = app;
