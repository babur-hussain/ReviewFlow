const express = require("express");
const PhotoJob = require("../models/PhotoJob");
const router = express.Router();

router.post("/n8n-result", async (req, res, next) => {
  try {
    const { jobId, enhancedImageUrl, error } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    const job = await PhotoJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (error) {
      job.status = "failed";
    } else if (enhancedImageUrl) {
      job.status = "completed";
      job.enhancedImageUrl = enhancedImageUrl;
    } else {
      job.status = "failed";
    }

    await job.save();

    return res.json({ success: true, message: "Job updated successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
