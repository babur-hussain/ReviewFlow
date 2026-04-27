const admin = require("firebase-admin");
const fs = require("fs");
const env = require("./env");

let firebaseApp;

const getFirebaseApp = () => {
  if (firebaseApp) return firebaseApp;

  // Check for already initialized default app
  if (admin.apps.length > 0) {
    firebaseApp = admin.app();
    return firebaseApp;
  }

  console.log("[firebase] Initializing Firebase Admin SDK...");

  if (env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey) {
    try {
      const formattedKey = env.firebasePrivateKey
        .replace(/\\n/g, "\n")
        .replace(/^"(.*)"$/, "$1")
        .replace(/^'(.*)'$/, "$1");

      // Set environment variable to help SDK detect project ID
      process.env.GOOGLE_CLOUD_PROJECT = env.firebaseProjectId;

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.firebaseProjectId,
          clientEmail: env.firebaseClientEmail,
          privateKey: formattedKey,
        }),
        projectId: env.firebaseProjectId,
      });

      console.log(`[firebase] Success: Initialized for project ${env.firebaseProjectId}`);
      return firebaseApp;
    } catch (error) {
      console.error("[firebase] Critical Init Error:", error.message);
    }
  } else {
    console.warn("[firebase] Warning: Missing credentials. Falling back to default environment auth.");
  }

  try {
    firebaseApp = admin.initializeApp();
    console.log("[firebase] Initialized with default credentials");
  } catch (error) {
    console.error("[firebase] Failed to initialize Firebase:", error.message);
    // Return a dummy object if all fails to prevent total crash on import
    firebaseApp = admin;
  }

  return firebaseApp;
};

// Auto-initialize on module load to ensure admin.auth() works immediately
getFirebaseApp();

module.exports = {
  admin,
  getFirebaseApp,
};
