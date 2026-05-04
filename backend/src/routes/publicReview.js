const express = require("express");
const rateLimit = require("express-rate-limit");
const Business = require("../models/Business");
const ReviewLog = require("../models/ReviewLog");
const env = require("../config/env");

const router = express.Router();

const reviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many review requests. Please wait a moment." },
});

function publicBusiness(business) {
  return {
    name: business.name,
    slug: business.slug,
    type: business.type,
    city: business.city,
    googleReviewUrl: business.googleReviewUrl,
    branding: business.branding,
  };
}

function pickFallback(business, starRating) {
  const options = business.fallbackReviews?.[starRating] || business.fallbackReviews?.[String(starRating)] || [];
  if (!options.length) return business.sampleReview;
  return options[Math.floor(Math.random() * options.length)];
}

async function callOpenRouter(business, starRating) {
  if (!env.openRouterApiKey) throw new Error("OpenRouter API key is not configured");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openRouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.frontendUrl,
      "X-Title": "Google Review Collection System",
    },
    body: JSON.stringify({
      model: env.openRouterModel,
      temperature: 1,
      messages: [
        { role: "system", content: business.systemPrompt },
        {
          role: "user",
          content: `Write one fresh ${starRating}-star Google review. Make it different from previous outputs and return only the review text.`,
        },
      ],
    }),
    signal: AbortSignal.timeout(9000),
  });

  if (!response.ok) throw new Error(`OpenRouter failed with ${response.status}`);
  const payload = await response.json();
  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenRouter returned no review text");
  return text.replace(/^["']|["']$/g, "");
}

router.get("/:slug", async (req, res, next) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug });
    if (!business) return res.status(404).json({ message: "Business not found" });
    res.json({ business: publicBusiness(business) });
  } catch (error) {
    next(error);
  }
});

router.post("/:slug/generate", reviewLimiter, async (req, res, next) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug });
    if (!business) return res.status(404).json({ message: "Business not found" });

    const starRating = Number(req.body.starRating);
    if (!Number.isInteger(starRating) || starRating < 1 || starRating > 5) {
      return res.status(400).json({ message: "Star rating must be between 1 and 5" });
    }

    let source = "ai";
    let reviewText;
    try {
      reviewText = await callOpenRouter(business, starRating);
    } catch (error) {
      source = "fallback";
      reviewText = pickFallback(business, starRating);
    }

    await ReviewLog.create({
      business: business._id,
      starRating,
      generatedReviewText: reviewText,
      source,
    });

    res.json({ reviewText, source, googleReviewUrl: business.googleReviewUrl });
  } catch (error) {
    next(error);
  }
});

const multer = require("multer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

const upload = multer({ storage: multer.memoryStorage() });

router.post("/:slug/enhance-photo", upload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No photo provided" });

    // Upload to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    const cldRes = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: "reviews",
    });

    const photoUrl = cldRes.secure_url;

    if (!env.photoWebhookUrl) {
      // Just return the Cloudinary URL if no webhook is configured
      return res.json({ imageUrl: photoUrl });
    }

    // Call N8N Webhook with the URL
    const webhookRes = await fetch(env.photoWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: photoUrl }), // Adjust property name if needed by n8n
    });

    if (!webhookRes.ok) {
      throw new Error(`Webhook failed with status ${webhookRes.status}`);
    }

    const contentType = webhookRes.headers.get("content-type") || "";

    if (contentType.includes("image")) {
      const arrayBuffer = await webhookRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.set("Content-Type", contentType);
      return res.send(buffer);
    } else if (contentType.includes("json")) {
      const data = await webhookRes.json();
      return res.json(data);
    } else {
      const arrayBuffer = await webhookRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.set("Content-Type", "image/png");
      return res.send(buffer);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
