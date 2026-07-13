import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MarketSummary } from "../models/MarketIntelligence.js";
import Company from "../models/Company.js";
import StudentProfile from "../models/StudentProfile.js";
import { generateMarketInsights } from "../utils/aiService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Sync Market Data
export const syncMarketData = async () => {
  try {
    console.log("🔄 [CareerPulseService] Starting Market Data Sync...");
    const dataPath = path.join(__dirname, "../data/marketData.json");
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const marketJobs = JSON.parse(rawData);

    // Analyze skills
    const skillCounts = {};
    const companyCounts = {};
    const roleCounts = {};

    marketJobs.forEach(job => {
      // Roles
      roleCounts[job.role] = (roleCounts[job.role] || 0) + 1;
      // Companies
      companyCounts[job.company] = (companyCounts[job.company] || 0) + 1;
      // Skills
      const allSkills = [...job.requiredSkills, ...(job.preferredSkills || [])];
      allSkills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    // Sort to get top 10
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => ({ skill: entry[0], count: entry[1], trend: "up" })); // hardcoding trend as "up" for MVP

    const topCompanies = Object.entries(companyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => ({ name: entry[0], count: entry[1] }));

    const trendingRoles = Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => ({ role: entry[0], count: entry[1] }));

    // Update MarketSummary DB
    let summary = await MarketSummary.findOne();
    if (!summary) {
      summary = new MarketSummary();
    }
    summary.topSkills = topSkills;
    summary.topCompanies = topCompanies;
    summary.trendingRoles = trendingRoles;
    summary.lastUpdated = new Date();
    await summary.save();

    console.log("✅ [CareerPulseService] MarketSummary updated.");

    // Update Companies in DB to reflect new requirements
    console.log("🔄 [CareerPulseService] Updating Company requirements based on live market...");
    const companies = await Company.find();
    for (const company of companies) {
      // Find jobs in marketData for this company
      const companyJobs = marketJobs.filter(j => j.company.toLowerCase() === company.name.toLowerCase());
      if (companyJobs.length > 0) {
        let reqSkills = new Set();
        let prefSkills = new Set();
        companyJobs.forEach(j => {
          j.requiredSkills.forEach(s => reqSkills.add(s));
          j.preferredSkills.forEach(s => prefSkills.add(s));
        });
        company.requiredSkills = Array.from(reqSkills);
        company.preferredTech = Array.from(prefSkills);
        await company.save();
      }
    }
    console.log("✅ [CareerPulseService] Companies updated.");

    return summary;
  } catch (error) {
    console.error("❌ [CareerPulseService] Sync failed:", error);
    throw error;
  }
};

// 2. Update Student Insights based on new market data
export const updateStudentInsights = async () => {
  try {
    console.log("🔄 [CareerPulseService] Updating Student Insights...");
    const summary = await MarketSummary.findOne();
    if (!summary) return;

    const marketTopSkills = summary.topSkills.map(s => s.skill.toLowerCase());
    const companies = await Company.find();
    const students = await StudentProfile.find();

    for (const profile of students) {
      const studentSkills = (profile.skills || []).map(s => s.toLowerCase());
      
      // Calculate missing top market skills
      const missingSkillsRaw = marketTopSkills.filter(ms => !studentSkills.includes(ms));
      // Just keep original casing for missing skills
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
        // Call Gemini to generate insight
        try {
           recommendation = await generateMarketInsights(profile, missingSkills, summary);
        } catch (e) {
           console.log("AI generation failed for market insight", e.message);
           recommendation = `Learning ${missingSkills[0]} could significantly improve your placement readiness, as it is highly demanded by top companies right now.`;
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
