import SuggestedCompany from "../models/SuggestedCompany.js";

/**
 * Validates a student's match results against live market data for their location.
 * @param {Object} studentProfile
 * @param {Array} matches Array of match objects from getRecruiterMatches
 * @param {Object} marketSummary Document from MarketSummary collection
 * @returns {Object} marketInsights
 */
export const validateMatchesWithMarket = async (studentProfile, matches, marketSummary) => {
  if (!marketSummary) {
    return {
      insightSkills: null,
      insightCompanies: null,
      message: "No live market data available for your location yet."
    };
  }

  const location = marketSummary.location;

  // 1. Cross-reference required skills
  const requiredSkillsSet = new Set();
  matches.forEach(m => {
    (m.requiredSkills || []).forEach(s => requiredSkillsSet.add(s.toLowerCase()));
  });
  
  const marketSkillsLower = (marketSummary.topSkills || []).map(s => s.skill.toLowerCase());
  
  const overlappingSkills = Array.from(requiredSkillsSet).filter(s => marketSkillsLower.includes(s));
  
  let insightSkills = null;
  if (overlappingSkills.length > 0) {
    insightSkills = `${overlappingSkills.length} of your target companies' required skills are also top demanded skills in ${location} right now: ${overlappingSkills.slice(0, 3).join(", ")}${overlappingSkills.length > 3 ? "..." : ""}.`;
  }

  // 2. Cross-reference companies
  const matchedCompanyNamesLower = matches.map(m => m.name.toLowerCase());
  const suggestedCompanyNames = [];
  
  const topMarketCompanies = marketSummary.topCompanies || [];
  
  for (const mc of topMarketCompanies) {
    if (mc.name && mc.name !== "Unknown") {
      if (!matchedCompanyNamesLower.includes(mc.name.toLowerCase())) {
        suggestedCompanyNames.push(mc.name);
        
        // Log to Admin review queue
        try {
          await SuggestedCompany.findOneAndUpdate(
            { companyName: mc.name, sourceLocation: location },
            { $inc: { timesSuggested: 1 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        } catch (err) {
          console.error("Failed to log suggested company:", err);
        }
      }
    }
  }

  let insightCompanies = null;
  if (suggestedCompanyNames.length > 0) {
    // Pick the top trending role if available
    const topRole = marketSummary.trendingRoles && marketSummary.trendingRoles.length > 0 
      ? marketSummary.trendingRoles[0].role 
      : "various roles";

    insightCompanies = `Companies actively hiring for ${topRole} in ${location} aren't yet in your matched list \u2014 consider researching them: ${suggestedCompanyNames.slice(0, 3).join(", ")}.`;
  }

  return {
    location,
    insightSkills,
    insightCompanies,
    lastUpdated: marketSummary.lastUpdated
  };
};
