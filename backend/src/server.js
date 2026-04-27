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
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
const origins = [env.frontendUrl];
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "750kb" }));

app.get("/health", (req, res) => res.json({ ok: true }));
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
