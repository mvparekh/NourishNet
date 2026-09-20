const DEFAULT_SMART_MATCH_WEIGHTS = {
  w1Expiry: 0.4,
  w2Quantity: 0.2,
  w3Distance: 0.25,
  w4CategoryFit: 0.15,
  maxExpiryWindowHours: 24,
  maxQuantityCap: 60,
  maxDistanceCapKm: 25,
  kgPerMealFactor: 0.42
};
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}
function getHoursRemaining(expiresAtIso, fromDate = /* @__PURE__ */ new Date()) {
  const expires = new Date(expiresAtIso).getTime();
  const now = fromDate.getTime();
  const diffMs = expires - now;
  return diffMs / (1e3 * 60 * 60);
}
function formatExpiryCountdown(expiresAtIso, fromDate = /* @__PURE__ */ new Date()) {
  const hrs = getHoursRemaining(expiresAtIso, fromDate);
  if (hrs <= 0) {
    return { text: "Expired", isUrgent: true, isCritical: true };
  }
  const totalMins = Math.round(hrs * 60);
  if (totalMins < 60) {
    return { text: `Expires in ${totalMins}m`, isUrgent: true, isCritical: true };
  }
  const displayHours = Math.floor(totalMins / 60);
  const remainingMins = totalMins % 60;
  const text = remainingMins > 0 ? `Expires in ${displayHours}h ${remainingMins}m` : `Expires in ${displayHours}h`;
  return {
    text,
    isUrgent: hrs <= 2,
    isCritical: hrs <= 1
  };
}
function getCategoryUrgencyScore(category) {
  switch (category) {
    case "COOKED_MEAL":
    case "GUJARATI_THALI":
    case "BIRYANI_RICE":
    case "DAL_RICE":
      return 100;
    // Immediate consumption required
    case "ROTIS_BREADS":
    case "BAKERY":
    case "SNACKS_FARSAN":
      return 75;
    case "PRODUCE_VEG":
    case "DAIRY_PACKAGED":
      return 60;
    case "RAW_INGREDIENTS":
    default:
      return 40;
  }
}
function evaluateSmartMatch(listing, ngoUser, weights = DEFAULT_SMART_MATCH_WEIGHTS, nowDate = /* @__PURE__ */ new Date()) {
  const rawHoursRemaining = getHoursRemaining(listing.expiresAt, nowDate);
  const hoursRemaining = Math.max(0, rawHoursRemaining);
  const distanceKm = calculateHaversineDistance(
    listing.latitude,
    listing.longitude,
    ngoUser.latitude,
    ngoUser.longitude
  );
  const quantity = Math.max(0, listing.quantity);
  const expiryScore = 100 * (1 - Math.min(hoursRemaining, weights.maxExpiryWindowHours) / weights.maxExpiryWindowHours);
  const quantityScore = 100 * Math.min(quantity, weights.maxQuantityCap) / weights.maxQuantityCap;
  const distanceScore = 100 * (1 - Math.min(distanceKm, weights.maxDistanceCapKm) / weights.maxDistanceCapKm);
  const catScore = getCategoryUrgencyScore(listing.category);
  const weightedSum = weights.w1Expiry * expiryScore + weights.w2Quantity * quantityScore + weights.w3Distance * distanceScore + weights.w4CategoryFit * catScore;
  const score = Math.round(Math.min(100, Math.max(0, weightedSum)) * 10) / 10;
  const isHighUrgency = hoursRemaining <= 2;
  const urgencyLabel = hoursRemaining <= 0 ? "Window Expired" : hoursRemaining < 1 ? `Expires in ${Math.round(hoursRemaining * 60)} mins (Urgent)` : `Expires in ${Math.round(hoursRemaining * 10) / 10} hours`;
  const proximityLabel = distanceKm < 2 ? `Within immediate reach (${distanceKm} km in ${listing.donorLocality || "Surat"})` : `${distanceKm} km away in ${listing.donorLocality || "Surat"}`;
  const capacityMatchLabel = `Matches distribution target (~${listing.quantity} ${listing.unit.toLowerCase()})`;
  const compatibilityLabel = `${listing.dietaryType === "JAIN_VEG" ? "Jain Veg" : listing.dietaryType === "VEG" ? "Pure Veg" : "General"} Surplus`;
  const explanation = {
    hoursRemaining: Math.round(rawHoursRemaining * 10) / 10,
    distanceKm,
    urgencyLabel,
    proximityLabel,
    capacityMatchLabel,
    compatibilityLabel,
    isHighUrgency,
    score
  };
  return { score, explanation };
}
function rankListingsForNgo(listings, ngoUser, weights = DEFAULT_SMART_MATCH_WEIGHTS, nowDate = /* @__PURE__ */ new Date()) {
  const availableListings = listings.filter((l) => {
    if (l.status !== "AVAILABLE") return false;
    return getHoursRemaining(l.expiresAt, nowDate) > 0;
  });
  const scored = availableListings.map((listing) => {
    const { score, explanation } = evaluateSmartMatch(listing, ngoUser, weights, nowDate);
    return { listing, score, explanation };
  });
  return scored.sort((a, b) => b.score - a.score);
}
function getSmartMatchesForNgo(ngoUser, listings, weights = DEFAULT_SMART_MATCH_WEIGHTS, nowDate = /* @__PURE__ */ new Date()) {
  return rankListingsForNgo(listings, ngoUser, weights, nowDate);
}
export {
  DEFAULT_SMART_MATCH_WEIGHTS,
  calculateHaversineDistance,
  evaluateSmartMatch,
  formatExpiryCountdown,
  getHoursRemaining,
  getSmartMatchesForNgo,
  rankListingsForNgo
};
