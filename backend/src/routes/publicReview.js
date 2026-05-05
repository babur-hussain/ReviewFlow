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
  return text.replace(/^[\"']|[\"']$/g, "");
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

    // Send the generated review text to the specified webhook
    if (env.textWebhookUrl) {
      try {
        await fetch(env.textWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName: business.name,
            starRating,
            reviewText,
            source
          })
        });
      } catch (err) {
        console.error("Text webhook failed:", err);
      }
    }

    res.json({ reviewText, source, googleReviewUrl: business.googleReviewUrl });
  } catch (error) {
    next(error);
  }
});

// ─── Photo Enhancement ──────────────────────────────────────────────────────

const multer = require("multer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

const upload = multer({ storage: multer.memoryStorage() });
const PhotoJob = require("../models/PhotoJob");

// KIE AI cake enhancement prompt (extracted from n8n workflow)
const KIE_CAKE_PROMPT = `You are an elite, world-class food photography AI specialized in luxury cake imagery for premium bakery brands.

Your mission is to generate ultra-high-end, hyper-realistic cake images for a premium Indian bakery brand "Celebration Point, Betul", ensuring the output looks like a ₹10,000+ professional photoshoot.

-----------------------------------
🎯 BRAND CONTEXT (MANDATORY)
-----------------------------------
- Brand: Celebration Point (premium bakery)
- Location: Betul, Madhya Pradesh, India
- Positioning: Premium, high-quality, celebration-focused cakes
- USP: Custom cakes, photo cakes, wedding cakes, rich flavors, elegant presentation
- Emotional Tone: Celebration, happiness, luxury, indulgence, trust

Every image MUST feel:
→ premium
→ irresistible
→ Instagram-worthy
→ Google-review perfect
→ conversion-focused

-----------------------------------
📸 PHOTOGRAPHY STYLE (VERY IMPORTANT)
-----------------------------------
- Style: Ultra-realistic commercial food photography
- Camera: Full-frame DSLR / Sony A7R V / Canon R5 simulation
- Lens: 85mm / 50mm f1.4
- Depth of field: shallow, creamy bokeh
- Focus: razor-sharp on cake details
- Lighting:
  → soft diffused studio lighting
  → natural window light effect
  → subtle rim lighting for highlights
  → cinematic shadows
- Color grading:
  → rich, vibrant but natural
  → warm premium tones
  → no over-saturation

-----------------------------------
🎂 CAKE ENHANCEMENT RULES
-----------------------------------
- Preserve original cake design (if input image provided)
- Improve:
  → frosting smoothness
  → texture sharpness
  → shine and highlights
- Enhance toppings:
  → pistachios, saffron, chocolate, fruits should look premium
- Add subtle luxury elements:
  → edible gold flakes
  → glossy glaze highlights
  → fine texture detailing

-----------------------------------
🏆 COMPOSITION RULES
-----------------------------------
- Clean minimal background OR luxury cafe background
- Options:
  → marble table
  → wooden rustic table
  → soft blurred greenery
  → elegant bakery interior blur
- Avoid clutter
- Maintain center focus on cake
- Add depth using foreground blur if needed

-----------------------------------
✨ GOOGLE REVIEW OPTIMIZATION
-----------------------------------
Image must:
- Look authentic (NOT AI-looking)
- Be highly appetizing
- Make viewer WANT TO ORDER immediately
- Be suitable for:
  → Google reviews
  → Instagram posts
  → ads

-----------------------------------
🎨 DETAIL LEVEL (CRITICAL)
-----------------------------------
- Micro details:
  → cream texture lines visible
  → nut fragments crisp
  → moisture/gloss on surface
- Real shadows and reflections
- No plastic/artificial look

-----------------------------------
🚫 STRICTLY AVOID
-----------------------------------
- Cartoonish rendering
- Over-editing
- Unreal colors
- Fake textures
- Blurry or low-detail outputs
- Overcrowded backgrounds

-----------------------------------
💎 FINAL OUTPUT QUALITY
-----------------------------------
- 8K resolution feel
- Photorealistic
- Studio-grade finish
- Looks like shot by top food photographer

-----------------------------------
🧠 INTELLIGENCE MODE
-----------------------------------
If input image is provided:
→ regenerate same cake with massive quality upgrade

If no input:
→ design premium cake based on Indian celebrations

-----------------------------------
🎯 GOAL
-----------------------------------
Create the BEST cake image possible — better than top bakery brands, better than Zomato/Swiggy listings, and capable of making Celebration Point the #1 bakery in Betul visually.

Ultra-realistic premium cake photography, luxury Indian bakery style, Celebration Point Betul branding, cinematic lighting, shallow depth of field, 85mm lens, hyper-detailed frosting, edible gold accents, pistachio saffron toppings, marble surface, soft blurred background, commercial food photography, 8k quality, high-end studio shoot, natural shadows, glossy highlights, ultra appetizing, Instagram viral style`;

// POST /:slug/enhance-photo — upload to Cloudinary then call KIE AI directly
router.post("/:slug/enhance-photo", upload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No photo provided" });

    // 1. Upload raw photo to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const cldRes = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: "reviews",
    });

    const photoUrl = cldRes.secure_url;

    if (!env.kieApiKey) {
      // No KIE key configured — return original Cloudinary URL directly
      return res.json({ imageUrl: photoUrl });
    }

    // 2. Convert Cloudinary URL to JPG (required by KIE AI)
    const jpgUrl = photoUrl
      .replace("/upload/", "/upload/f_jpg,q_90/")
      .replace(/\.[^.]+$/, ".jpg");

    // 3. Call KIE AI createTask directly
    const kieRes = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.kieApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-2-image-to-image",
        input: {
          prompt: KIE_CAKE_PROMPT,
          input_urls: [jpgUrl],
          aspect_ratio: "1:1",
        },
      }),
    });

    if (!kieRes.ok) {
      const errText = await kieRes.text();
      console.error("KIE AI createTask failed:", kieRes.status, errText);
      // Fallback: return original Cloudinary image so the user still sees something
      return res.json({ imageUrl: photoUrl });
    }

    const kieData = await kieRes.json();
    const kieTaskId = kieData.data?.taskId;

    if (!kieTaskId) {
      console.error("KIE AI returned no taskId:", JSON.stringify(kieData));
      return res.json({ imageUrl: photoUrl });
    }

    // 4. Create PhotoJob with kieTaskId — frontend polls until complete
    const job = await PhotoJob.create({
      originalImageUrl: photoUrl,
      kieTaskId,
    });

    return res.json({ jobId: job._id.toString(), status: "pending" });

  } catch (error) {
    next(error);
  }
});

// GET /photo-job/:jobId — live-checks KIE AI on each poll (serverless-safe, no background process)
router.get("/photo-job/:jobId", async (req, res, next) => {
  try {
    const job = await PhotoJob.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Already settled — return cached result immediately
    if (job.status !== "pending") {
      return res.json({
        jobId: job._id,
        status: job.status,
        originalImageUrl: job.originalImageUrl,
        enhancedImageUrl: job.enhancedImageUrl,
      });
    }

    // Live-check KIE AI status on every frontend poll
    if (job.kieTaskId && env.kieApiKey) {
      try {
        const kieRes = await fetch(
          `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${job.kieTaskId}`,
          { headers: { "Authorization": `Bearer ${env.kieApiKey}` } }
        );

        if (kieRes.ok) {
          const kieData = await kieRes.json();
          const state = kieData.data?.state;

          if (state === "success") {
            const parsed = kieData.data?.resultJson
              ? JSON.parse(kieData.data.resultJson)
              : {};
            const enhancedImageUrl = parsed.resultUrls?.[0] || null;

            if (enhancedImageUrl) {
              job.status = "completed";
              job.enhancedImageUrl = enhancedImageUrl;
              await job.save();
            }
          } else if (state === "failed" || state === "error") {
            job.status = "failed";
            await job.save();
          }
          // state "processing" / others → leave as pending, frontend will retry
        }
      } catch (kieErr) {
        console.error("KIE AI status check error:", kieErr);
      }
    }

    return res.json({
      jobId: job._id,
      status: job.status,
      originalImageUrl: job.originalImageUrl,
      enhancedImageUrl: job.enhancedImageUrl,
    });

  } catch (error) {
    next(error);
  }
});

router.post("/:slug/notify-combined", async (req, res, next) => {
  try {
    if (!env.combinedWebhookUrl) {
      return res.json({ message: "Combined webhook not configured" });
    }

    const business = await Business.findOne({ slug: req.params.slug });
    if (!business) return res.status(404).json({ message: "Business not found" });

    const { reviewText, starRating, enhancedImageUrl, originalImageUrl } = req.body;

    try {
      await fetch(env.combinedWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: business.name,
          starRating,
          reviewText,
          enhancedImageUrl,
          originalImageUrl
        })
      });
    } catch (err) {
      console.error("Combined webhook failed:", err);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
