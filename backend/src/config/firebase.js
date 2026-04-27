const admin = require("firebase-admin");
const fs = require("fs");
const env = require("./env");

function getFirebaseApp() {
  if (admin.apps.length) return admin.app();

  if (env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey.replace(/\\n/g, "\n"),
      }),
    });
    return admin.app();
  }

  if (env.googleApplicationCredentials && fs.existsSync(env.googleApplicationCredentials)) {
    const serviceAccount = JSON.parse(fs.readFileSync(env.googleApplicationCredentials, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    return admin.app();
  }

  admin.initializeApp();
  return admin.app();
}

module.exports = {
  admin,
  getFirebaseApp,
};
