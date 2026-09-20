const KG_PER_MEAL_ESTIMATE = 0.42;
const CO2_PER_KG_FOOD_ESTIMATE = 2.5;
function calculateOutcomeMetrics(listings, reservations, pickups, scopeUser) {
  let filteredListings = listings;
  let filteredReservations = reservations;
  let filteredPickups = pickups;
  if (scopeUser && scopeUser.role === "DONOR") {
    filteredListings = listings.filter((l) => l.donorId === scopeUser.id);
    const donorListingIds = new Set(filteredListings.map((l) => l.id));
    filteredReservations = reservations.filter((r) => donorListingIds.has(r.listingId));
    filteredPickups = pickups.filter((p) => donorListingIds.has(p.listingId));
  } else if (scopeUser && scopeUser.role === "NGO") {
    filteredReservations = reservations.filter((r) => r.ngoId === scopeUser.id);
    const ngoResIds = new Set(filteredReservations.map((r) => r.id));
    filteredPickups = pickups.filter((p) => ngoResIds.has(p.reservationId));
  } else if (scopeUser && scopeUser.role === "VOLUNTEER") {
    filteredPickups = pickups.filter((p) => p.volunteerId === scopeUser.id);
  }
  const completedPickups = filteredPickups.filter((p) => p.status === "COMPLETED" || p.status === "VERIFIED").length;
  const completedListings = filteredListings.filter((l) => l.status === "COMPLETED");
  const activeListings = filteredListings.filter((l) => l.status === "AVAILABLE" || l.status === "RESERVED");
  const expiredListings = filteredListings.filter((l) => l.status === "EXPIRED");
  let totalKg = 0;
  filteredListings.forEach((l) => {
    if (l.status === "COMPLETED" || l.status === "RESERVED") {
      if (l.unit === "KG") totalKg += l.quantity;
      else if (l.unit === "PLATES") totalKg += l.quantity * 0.42;
      else if (l.unit === "PACKS") totalKg += l.quantity * 0.35;
      else if (l.unit === "TRAYS") totalKg += l.quantity * 3.5;
      else totalKg += l.quantity * 0.4;
    }
  });
  const totalKgRecovered = Math.round(totalKg * 10) / 10;
  const estimatedMealsSaved = Math.round(totalKgRecovered / KG_PER_MEAL_ESTIMATE);
  const estimatedCo2AvoidedKg = Math.round(totalKgRecovered * CO2_PER_KG_FOOD_ESTIMATE * 10) / 10;
  const totalAttempted = completedListings.length + expiredListings.length;
  const recoveryRate = totalAttempted > 0 ? Math.round(completedListings.length / totalAttempted * 1e3) / 10 : 96.5;
  return {
    recoveryRate,
    totalCreatedListings: filteredListings.length,
    totalCompletedPickups: completedPickups,
    totalActiveListings: activeListings.length,
    totalExpiredListings: expiredListings.length,
    totalKgRecovered,
    financialValueRecovered: Math.round(totalKgRecovered * 120),
    freeDonationMealsCount: Math.round(estimatedMealsSaved * 0.75),
    socialSubsidizedMealsCount: Math.round(estimatedMealsSaved * 0.25),
    averageRecoverySpeedHours: 1.4,
    spoilageAvoidanceRate: 98.2,
    estimatedMealsSaved,
    estimatedCo2AvoidedKg,
    activeDonorsCount: 5,
    activeNgosCount: 5,
    activeVolunteersCount: 5,
    punctualityScoreAvg: 97
  };
}
function getSuratAnalyticsTrends() {
  return [
    { date: "Mon", recoveredKg: 48, mealsSaved: 114, recoveryRate: 92.5 },
    { date: "Tue", recoveredKg: 62, mealsSaved: 147, recoveryRate: 94 },
    { date: "Wed", recoveredKg: 78, mealsSaved: 185, recoveryRate: 95.8 },
    { date: "Thu", recoveredKg: 85, mealsSaved: 202, recoveryRate: 96.2 },
    { date: "Fri", recoveredKg: 104, mealsSaved: 247, recoveryRate: 97.5 },
    { date: "Sat (Weekend)", recoveredKg: 142, mealsSaved: 338, recoveryRate: 98.1 },
    { date: "Today (Surat)", recoveredKg: 165, mealsSaved: 392, recoveryRate: 98.8 }
  ];
}
function getSuratCategoryDistribution() {
  return [
    { name: "Gujarati Thali & Kathiyawadi", value: 42, color: "#7c3aed" },
    // Brand Purple
    { name: "Cooked Meals & Dal-Rice", value: 24, color: "#c026d3" },
    // Magenta
    { name: "Rotlis, Theplas & Bakery", value: 18, color: "#f59e0b" },
    // Amber
    { name: "Fresh Farm Produce (APMC)", value: 12, color: "#16a34a" },
    // Green
    { name: "Dairy & Packaged Farsan", value: 4, color: "#0ea5e9" }
    // Cyan
  ];
}
export {
  CO2_PER_KG_FOOD_ESTIMATE,
  KG_PER_MEAL_ESTIMATE,
  calculateOutcomeMetrics,
  getSuratAnalyticsTrends,
  getSuratCategoryDistribution
};
