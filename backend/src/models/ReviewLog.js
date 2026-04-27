const mongoose = require("mongoose");

const reviewLogSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    starRating: { type: Number, min: 1, max: 5, required: true },
    generatedReviewText: { type: String, required: true },
    source: { type: String, enum: ["ai", "fallback"], default: "ai" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReviewLog", reviewLogSchema);
