const mongoose = require("mongoose");
const env = require("./env");

async function connectDb() {
  if (mongoose.connection.readyState === 1) return;

  if (!env.mongoUri) {
    console.error("[db] MONGODB_URI is missing from environment variables");
    throw new Error("MONGODB_URI is required");
  }

  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.mongoUri);
    console.log("[db] Connected to MongoDB");
  } catch (error) {
    console.error("[db] Connection error:", error.message);
    throw error;
  }
}

module.exports = connectDb;
