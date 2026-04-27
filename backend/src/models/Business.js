const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    googlePlaceId: { type: String, required: true, trim: true },
    googleReviewUrl: { type: String, required: true, trim: true },
    personality: {
      special: { type: String, required: true },
    },
    customers: {
      typical: [{ type: String }],
      mainReason: { type: String, required: true },
      desiredFeeling: { type: String, required: true },
    },
    love: {
      compliments: [{ type: String }],
      staffNames: [{ type: String }],
      signatures: { type: String },
    },
    brandVoice: {
      tone: { type: String, required: true },
      language: { type: String, required: true },
    },
    branding: {
      logoDataUrl: { type: String },
      primaryColor: { type: String, default: "#2563eb" },
    },
    systemPrompt: { type: String, required: true },
    sampleReview: { type: String, required: true },
    reviewPageUrl: { type: String, required: true },
    qrCodeSvg: { type: String, required: true },
    qrCodePngDataUrl: { type: String, required: true },
    fallbackReviews: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
