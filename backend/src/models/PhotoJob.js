const mongoose = require("mongoose");

const photoJobSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    originalImageUrl: {
      type: String,
      required: true,
    },
    enhancedImageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PhotoJob", photoJobSchema);
