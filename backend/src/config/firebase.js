const admin = require("firebase-admin");
const fs = require("fs");
const env = require("./env");

function getFirebaseApp() {
  if (admin.apps.length) return admin.app();

  if (env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.firebaseProjectId,
          clientEmail: env.firebaseClientEmail,
          privateKey: env.firebasePrivateKey.replace(/\\n/g, "\n"),
        }),
      });
      console.log("[firebase] Initialized with individual keys");
      return admin.app();
    } catch (error) {
      console.error("[firebase] Initialization error:", error.message);
    }
  }

  try {
    admin.initializeApp();
    console.log("[firebase] Initialized with default credentials");
  } catch (error) {
    console.error("[firebase] Failed to initialize Firebase:", error.message);
  }

  return admin.app();
}

module.exports = {
  admin,
  getFirebaseApp,
};
