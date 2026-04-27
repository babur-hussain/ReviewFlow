const express = require("express");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  await req.user.populate("business");
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      displayName: req.user.displayName,
      onboardingComplete: req.user.onboardingComplete,
      business: req.user.business,
    },
  });
});

module.exports = router;
