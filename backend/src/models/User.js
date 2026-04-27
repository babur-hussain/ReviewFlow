const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    displayName: { type: String, trim: true },
    photoURL: { type: String },
    onboardingComplete: { type: Boolean, default: false },
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
