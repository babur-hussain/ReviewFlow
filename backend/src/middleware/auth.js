const { admin, getFirebaseApp } = require("../config/firebase");
const User = require("../models/User");

getFirebaseApp();

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        $setOnInsert: {
          firebaseUid: decoded.uid,
        },
        $set: {
          email: decoded.email || "",
          displayName: decoded.name || "",
          photoURL: decoded.picture || "",
        },
      },
      { upsert: true, new: true }
    );

    req.auth = decoded;
    req.user = user;
    next();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] Firebase token verification failed:", {
        code: error.code,
        message: error.message,
        projectId: admin.app().options.projectId,
      });
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = requireAuth;
