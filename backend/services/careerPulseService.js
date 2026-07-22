import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MarketSummary } from "../models/MarketIntelligence.js";
import Company from "../models/Company.js";
import StudentProfile from "../models/StudentProfile.js";
import { generateMarketInsights } from "../utils/aiService.js";
import { fetchAdzunaJobs } from "./adzunaService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shared logic to extract insights from a list of jobs
const extractMarketInsights = (marketJobs) => {
  const skillCounts = {};
  const companyCounts = {};
  const roleCounts = {};

  marketJobs.forEach(job => {
    // Adzuna schema (title, company.display_name, description) vs old schema
    const role = job.title || job.role || "Software Engineer";
    const company = job.company?.display_name || (typeof job.company === 'string' ? job.company : "Unknown");
    
    roleCounts[role] = (roleCounts[role] || 0) + 1;
    companyCounts[company] = (companyCounts[company] || 0) + 1;

    // Very naive skill extraction from description for Adzuna, or use existing arrays if offline
    let allSkills = [];
    if (job.requiredSkills) {
      allSkills = [...job.requiredSkills, ...(job.preferredSkills || [])];
    } else if (job.description) {
      const desc = job.description.toLowerCase();
      const techKeywords = ["react", "node", "javascript", "python", "java", "sql", "aws", "docker", "kubernetes", "c++", "go", "ruby", "typescript", "mongodb", "postgresql", "html", "css", "vue", "angular"];
      techKeywords.forEach(k => {
        if (desc.includes(k)) allSkills.push(k);
      });
    }

    allSkills.forEach(skill => {
      // capitalize first letter for display
      const displaySkill = skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
      skillCounts[displaySkill] = (skillCounts[displaySkill] || 0) + 1;
    });
  });

  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => ({ skill: entry[0], count: entry[1], trend: "up" }));

  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => ({ name: entry[0], count: entry[1] }));

  const trendingRoles = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => ({ role: entry[0], count: entry[1] }));

  return { topSkills, topCompanies, trendingRoles };
};

// 1. Sync Market Data with Live Adzuna API
export const syncMarketData = async () => {
  try {
    console.log("🔄 [CareerPulseService] Starting Live Market Data Sync...");
    
    // Get distinct locations from students
    const locations = await StudentProfile.distinct("location");
    const uniqueLocations = locations.filter(loc => loc && loc.trim() !== "");
    
    if (uniqueLocations.length === 0) {
      uniqueLocations.push("Bangalore"); // Default if no locations set
    }

    const summaries = [];

    for (const location of uniqueLocations) {
      console.log(`\n📍 Processing market data for location: ${location}`);
      try {
        const jobs = await fetchAdzunaJobs(location);
        
        if (!jobs || jobs.length === 0) {
           console.log(`⚠️ No jobs found for ${location}, skipping update.`);
           continue;
        }

        const { topSkills, topCompanies, trendingRoles } = extractMarketInsights(jobs);

        let summary = await MarketSummary.findOne({ location });
        if (!summary) {
          summary = new MarketSummary({ location });
        }
        
        summary.topSkills = topSkills;
        summary.topCompanies = topCompanies;
        summary.trendingRoles = trendingRoles;
        summary.lastRefreshedAt = new Date();
        summary.lastUpdated = new Date();
        
        await summary.save();
        summaries.push(summary);
        console.log(`✅ [CareerPulseService] MarketSummary updated for ${location}.`);

        // Optionally update Companies in DB if we want them to track Adzuna jobs
        // (Simplified for now, as Adzuna jobs don't perfectly map to our Company schema without heavy NLP)

      } catch (err) {
        console.error(`❌ Error syncing for ${location}:`, err.message);
        // Continue to next location without overwriting cache
      }
    }
    
    return summaries;
  } catch (error) {
    console.error("❌ [CareerPulseService] Sync failed:", error);
    throw error;
  }
};

// 1b. Fallback offline sync using JSON
export const syncMarketDataOffline = async () => {
  try {
    console.log("🔄 [CareerPulseService] Starting Offline Market Data Sync...");
    const dataPath = path.join(__dirname, "../data/marketData.json");
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const marketJobs = JSON.parse(rawData);

    const { topSkills, topCompanies, trendingRoles } = extractMarketInsights(marketJobs);

    const location = "Bangalore"; // Default location for offline
    let summary = await MarketSummary.findOne({ location });
    if (!summary) summary = new MarketSummary({ location });
    
    summary.topSkills = topSkills;
    summary.topCompanies = topCompanies;
    summary.trendingRoles = trendingRoles;
    summary.lastRefreshedAt = new Date();
    await summary.save();
    
    return [summary];
  } catch (error) {
    console.error("❌ [CareerPulseService] Offline Sync failed:", error);
    throw error;
  }
};

// 2. Update Student Insights based on new market data
export const updateStudentInsights = async () => {
  try {
    console.log("🔄 [CareerPulseService] Updating Student Insights...");
    
    const companies = await Company.find();
    const students = await StudentProfile.find();

    for (const profile of students) {
      const loc = profile.location && profile.location.trim() !== "" ? profile.location : "Bangalore";
      
      const summary = await MarketSummary.findOne({ location: loc });
      if (!summary) continue; // skip if no market data for their location

      const marketTopSkills = summary.topSkills.map(s => s.skill.toLowerCase());
      const studentSkills = (profile.skills || []).map(s => s.toLowerCase());
      
      // Calculate missing top market skills
      const missingSkillsRaw = marketTopSkills.filter(ms => !studentSkills.includes(ms));
      const missingSkills = summary.topSkills
        .filter(s => missingSkillsRaw.includes(s.skill.toLowerCase()))
        .map(s => s.skill);

      // Re-calculate company match scores
      const newMatches = companies.map(company => {
        let score = 0;
        const gpaDiff = (profile.gpa || 7) - company.minGpa;
        let gpaScore = 0;
        if (gpaDiff >= 0) gpaScore = 30;
        else if (gpaDiff >= -0.5) gpaScore = 15;

        let matchedSkills = [];
        if (company.requiredSkills && company.requiredSkills.length > 0) {
          company.requiredSkills.forEach(s => {
            if (studentSkills.includes(s.toLowerCase())) matchedSkills.push(s);
          });
          score += (matchedSkills.length / company.requiredSkills.length) * 40;
        } else {
          score += 40;
        }

        let matchedTech = [];
        if (company.preferredTech && company.preferredTech.length > 0) {
          const studentTechLower = (profile.resumeDetails?.technologies || profile.resumeDetails?.technicalSkills || profile.skills || []).map(t => t.toLowerCase());
          company.preferredTech.forEach(t => {
            if (studentTechLower.includes(t.toLowerCase())) matchedTech.push(t);
          });
          score += (matchedTech.length / company.preferredTech.length) * 30;
        } else {
          score += 30;
        }

        return { company: company.name, score: Math.round(score + gpaScore) };
      });

      // Compare with previous matches to generate AI Alerts
      const alerts = profile.marketIntelligence?.aiAlerts || [];
      const history = profile.marketIntelligence?.matchHistory || [];
      
      newMatches.forEach(newMatch => {
        const oldMatch = history.find(h => h.company === newMatch.company);
        if (oldMatch) {
          if (newMatch.score > oldMatch.score + 2) {
            alerts.unshift({
              message: `🎯 Your profile now matches ${newMatch.company} with ${newMatch.score}%!`,
              type: "success",
              date: new Date()
            });
          } else if (newMatch.score < oldMatch.score - 2) {
            alerts.unshift({
              message: `📉 ${newMatch.company} match dropped to ${newMatch.score}%. Check their new required skills.`,
              type: "warning",
              date: new Date()
            });
          }
        }
      });

      // Generate AI Recommendation
      let recommendation = profile.marketIntelligence?.recommendation || "";
      if (missingSkills.length > 0) {
        try {
           recommendation = await generateMarketInsights(profile, missingSkills, summary);
        } catch (e) {
           console.log("AI generation failed for market insight", e.message);
           recommendation = `Learning ${missingSkills[0]} could significantly improve your placement readiness in ${loc}, as it is highly demanded by top companies right now.`;
        }
      }

      profile.marketIntelligence = {
        missingSkills,
        recommendation,
        aiAlerts: alerts.slice(0, 10), // keep last 10
        matchHistory: newMatches,
        lastUpdated: new Date()
      };

      await profile.save();
    }
    console.log("✅ [CareerPulseService] Student Insights updated successfully.");
  } catch (error) {
    console.error("❌ [CareerPulseService] Update failed:", error);
  }
};
