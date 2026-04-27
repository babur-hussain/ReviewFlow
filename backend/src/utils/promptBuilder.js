const toneDescriptions = {
  warm: "Warm and personal, like a trusted friend recommending the business.",
  professional: "Professional and credible, formal enough to feel trustworthy without sounding stiff.",
  casual: "Casual and fun, relaxed, conversational, and easy to read.",
  enthusiastic: "Enthusiastic and energetic, positive and lively while staying believable.",
};

function buildSystemPrompt(data) {
  const compliments = data.love.compliments.length ? data.love.compliments.join(", ") : "the overall experience";
  const staff = data.love.staffNames.length ? data.love.staffNames.join(", ") : "team members only when naturally relevant";
  const customers = data.customers.typical.length ? data.customers.typical.join(", ") : "local customers";

  return [
    `You write natural Google review drafts for ${data.name}, a ${data.type} in ${data.city}.`,
    "",
    "Business context:",
    `- What makes the business special: ${data.personality.special}`,
    `- Typical customers: ${customers}`,
    `- Main reason customers come in: ${data.customers.mainReason}`,
    `- Feeling customers should leave with: ${data.customers.desiredFeeling}`,
    `- Common compliments to mention naturally: ${compliments}`,
    `- Loved staff members to mention only when it feels organic: ${staff}`,
    `- Signature products, dishes, or services: ${data.love.signatures || "Mention only the highlighted strengths instead."}`,
    "",
    "Voice and language:",
    `- Tone: ${toneDescriptions[data.brandVoice.tone] || data.brandVoice.tone}`,
    `- Language: ${data.brandVoice.language}`,
    "",
    "Strict writing rules:",
    "- Never sound like AI, marketing copy, or a paid testimonial.",
    "- Never use these overused words: amazing, fantastic, wonderful, delightful, exceptional, outstanding.",
    "- Never start the review with the word \"I\".",
    "- Keep the review between 40 and 90 words.",
    "- Vary sentence structure every time.",
    "- Sound like a real local customer who genuinely visited.",
    "- Mention one or two specific things the business owner highlighted, not every detail.",
    "- Match the selected brand tone and selected language.",
    "- Do not include hashtags, emojis, quotation marks around the review, markdown, or a title.",
    "- Do not make claims about medical, legal, financial, or safety outcomes.",
    "- If the rating is below 5 stars, stay fair and constructive while still sounding authentic.",
  ].join("\n");
}

function buildSampleReview(data) {
  const compliment = data.love.compliments[0] || "service";
  const signature = data.love.signatures || data.customers.mainReason;
  const cityPart = data.city ? ` in ${data.city}` : "";
  return `Such a pleasant place${cityPart}. The ${compliment} stood out right away, and ${signature} made the visit feel genuinely worth it. The team keeps things smooth without making anything feel rushed. Easy to recommend for anyone who wants a reliable, comfortable experience.`;
}

module.exports = {
  buildSystemPrompt,
  buildSampleReview,
};
