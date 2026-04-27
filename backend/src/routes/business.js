const express = require("express");
const slugify = require("slugify");
const Business = require("../models/Business");
const ReviewLog = require("../models/ReviewLog");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");
const { buildSampleReview, buildSystemPrompt } = require("../utils/promptBuilder");
const fallbackTemplates = require("../data/fallbackReviews");
const makeQrCodes = require("../utils/qr");
const env = require("../config/env");
const { cleanArray, cleanPlainString, isHexColor, isSafeUrl } = require("../utils/sanitize");

const router = express.Router();

function normalizePayload(body) {
  const type = cleanPlainString(body.type || "other", 40).toLowerCase();
  const data = {
    name: cleanPlainString(body.name, 120),
    type,
    city: cleanPlainString(body.city, 120),
    googlePlaceId: cleanPlainString(body.googlePlaceId, 180),
    googleReviewUrl: cleanPlainString(body.googleReviewUrl, 800),
    personality: {
      special: cleanPlainString(body.personality?.special, 1200),
    },
    customers: {
      typical: cleanArray(body.customers?.typical, 12, 80),
      mainReason: cleanPlainString(body.customers?.mainReason, 600),
      desiredFeeling: cleanPlainString(body.customers?.desiredFeeling, 400),
    },
    love: {
      compliments: cleanArray(body.love?.compliments, 20, 80),
      staffNames: cleanArray(body.love?.staffNames, 12, 60),
      signatures: cleanPlainString(body.love?.signatures, 700),
    },
    brandVoice: {
      tone: cleanPlainString(body.brandVoice?.tone || "warm", 40),
      language: cleanPlainString(body.brandVoice?.language || "English", 80),
    },
    branding: {
      logoDataUrl: typeof body.branding?.logoDataUrl === "string" && body.branding.logoDataUrl.startsWith("data:image/")
        ? body.branding.logoDataUrl.slice(0, 600000)
        : "",
      primaryColor: isHexColor(body.branding?.primaryColor) ? body.branding.primaryColor : "#2563eb",
    },
  };

  const missing = [];
  ["name", "type", "city", "googlePlaceId", "googleReviewUrl"].forEach((key) => {
    if (!data[key]) missing.push(key);
  });
  if (!data.personality.special) missing.push("personality.special");
  if (!data.customers.mainReason) missing.push("customers.mainReason");
  if (!data.customers.desiredFeeling) missing.push("customers.desiredFeeling");
  if (!isSafeUrl(data.googleReviewUrl)) missing.push("googleReviewUrl");
  if (missing.length) {
    const error = new Error(`Missing or invalid fields: ${missing.join(", ")}`);
    error.status = 400;
    error.publicMessage = error.message;
    throw error;
  }
  return data;
}

async function uniqueSlug(name) {
  const base = slugify(name, { lower: true, strict: true }).slice(0, 70) || "business";
  let slug = base;
  let counter = 2;
  while (await Business.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

router.post("/prompt-preview", requireAuth, async (req, res, next) => {
  try {
    const data = normalizePayload(req.body);
    res.json({
      systemPrompt: buildSystemPrompt(data),
      sampleReview: buildSampleReview(data),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/onboarding", requireAuth, async (req, res, next) => {
  try {
    const data = normalizePayload(req.body);
    const existing = await Business.findOne({ owner: req.user._id });
    const slug = existing?.slug || (await uniqueSlug(data.name));
    const reviewPageUrl = `${env.publicBaseUrl.replace(/\/$/, "")}/review/${slug}`;
    const qrCodes = await makeQrCodes(reviewPageUrl);
    const customSystemPrompt = typeof req.body.customSystemPrompt === "string"
      ? req.body.customSystemPrompt.slice(0, 10000)
      : "";
    const systemPrompt = customSystemPrompt || buildSystemPrompt(data);
    const sampleReview = buildSampleReview(data);

    const business = await Business.findOneAndUpdate(
      { owner: req.user._id },
      {
        ...data,
        owner: req.user._id,
        slug,
        systemPrompt,
        sampleReview,
        reviewPageUrl,
        ...qrCodes,
        fallbackReviews: fallbackTemplates(data.type),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await User.findByIdAndUpdate(req.user._id, { onboardingComplete: true, business: business._id });
    res.json({ business });
  } catch (error) {
    next(error);
  }
});

router.get("/dashboard", requireAuth, async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) return res.status(404).json({ message: "Business not found" });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [allTime, thisMonth, ratingBreakdown, recent] = await Promise.all([
      ReviewLog.countDocuments({ business: business._id }),
      ReviewLog.countDocuments({ business: business._id, createdAt: { $gte: startOfMonth } }),
      ReviewLog.aggregate([
        { $match: { business: business._id } },
        { $group: { _id: "$starRating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      ReviewLog.find({ business: business._id }).sort({ createdAt: -1 }).limit(12).select("starRating createdAt source"),
    ]);

    res.json({ business, metrics: { allTime, thisMonth, ratingBreakdown, recent } });
  } catch (error) {
    next(error);
  }
});

router.post("/regenerate-qr", requireAuth, async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) return res.status(404).json({ message: "Business not found" });
    const qrCodes = await makeQrCodes(business.reviewPageUrl);
    business.qrCodeSvg = qrCodes.qrCodeSvg;
    business.qrCodePngDataUrl = qrCodes.qrCodePngDataUrl;
    await business.save();
    res.json({ qrCodeSvg: business.qrCodeSvg, qrCodePngDataUrl: business.qrCodePngDataUrl });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
