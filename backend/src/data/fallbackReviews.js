const adjectives = {
  restaurant: ["food", "service", "flavours", "seating", "recommendations"],
  clinic: ["care", "clean setup", "clear guidance", "staff", "appointment"],
  salon: ["styling", "staff", "finish", "products", "attention"],
  hotel: ["rooms", "check-in", "service", "comfort", "location"],
  shop: ["selection", "prices", "staff", "quality", "checkout"],
  cafe: ["coffee", "snacks", "ambience", "service", "seating"],
  gym: ["equipment", "trainers", "cleanliness", "energy", "routine"],
  other: ["service", "team", "quality", "experience", "care"],
};

function fallbackTemplates(type = "other") {
  const items = adjectives[type] || adjectives.other;
  return {
    1: [
      `The visit did not go as expected. ${items[0]} and ${items[1]} could both be handled better, though the team was reachable and tried to respond.`,
      `Left feeling disappointed because the experience missed a few basics. Better attention to ${items[2]} would make a real difference.`,
      `There is potential here, but this visit was not smooth. The ${items[3]} needs more consistency for customers to feel confident returning.`,
      `Expected a more comfortable experience. A few parts felt rushed, especially around ${items[1]}, and it affected the overall impression.`,
      `Not the experience hoped for this time. Clearer communication and more care with ${items[4]} would help a lot.`,
    ],
    2: [
      `Some parts were fine, but the overall visit felt uneven. The ${items[0]} was okay, while ${items[1]} could use more attention.`,
      `A mixed experience. There were positives, but ${items[2]} and follow-through did not feel as strong as expected.`,
      `The place has promise, though this visit needed better consistency. A little more focus on ${items[3]} would improve things.`,
      `Decent in parts, but not fully satisfying. The team can make the experience better by improving ${items[4]}.`,
      `It was not bad, just not as smooth as expected. Better handling of ${items[1]} would make customers feel more looked after.`,
    ],
    3: [
      `A fair experience overall. The ${items[0]} was good in places, and with more consistency around ${items[1]}, it could be much stronger.`,
      `Worth trying, especially for the ${items[2]}. A few details could be improved, but the visit was still comfortable enough.`,
      `The experience was balanced. Some things worked well, while ${items[3]} could be more polished next time.`,
      `Good enough overall, with a few areas that need attention. The ${items[4]} stood out, and the team seemed willing to help.`,
      `A pleasant visit in parts. More consistency would help, but there were enough positives to consider coming back.`,
    ],
    4: [
      `Really liked the experience here. The ${items[0]} felt reliable, the ${items[1]} was handled well, and the team made the visit easy.`,
      `A very good place with a comfortable feel. The ${items[2]} stood out, and everything moved along without much effort.`,
      `Had a smooth visit and left happy. The ${items[3]} made a strong impression, and the overall service felt thoughtful.`,
      `Solid experience from start to finish. The ${items[4]} was especially good, and the team kept things relaxed and clear.`,
      `Easy to recommend. The place gets the important things right, especially ${items[0]} and the way customers are treated.`,
    ],
    5: [
      `Such a good experience from the moment we arrived. The ${items[0]} stood out, the ${items[1]} felt genuine, and everything was handled with care.`,
      `This place gets the small details right. The ${items[2]} was excellent without feeling overdone, and the team made the whole visit feel easy.`,
      `A reliable spot that feels welcoming every time. The ${items[3]} and overall attention make it easy to come back again.`,
      `Loved how smooth the visit felt. The ${items[4]} was handled well, and the team created a comfortable, positive experience.`,
      `A place worth recommending to friends and family. The ${items[0]} was memorable, and the service felt personal in the best way.`,
    ],
  };
}

module.exports = fallbackTemplates;
