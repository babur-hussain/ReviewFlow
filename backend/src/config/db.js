const mongoose = require("mongoose");
const env = require("./env");

async function connectDb() {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  console.log("[db] Connected to MongoDB");
}

module.exports = connectDb;
