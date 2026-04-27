const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const required = ["MONGODB_URI", "FRONTEND_URL"];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[env] Missing ${key}. The app may fail until it is configured.`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 8080,
  mongoUri: process.env.MONGODB_URI,
  frontendUrl: process.env.FRONTEND_URL,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  openRouterModel: process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4-5",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || process.env.FRONTEND_URL,
};
