import MatchScoreHistory from "../models/MatchScoreHistory.js";
import Company from "../models/Company.js";
import StudentProfile from "../models/StudentProfile.js";
import { calculateMatchScore } from "./matchScoring.js";

/**
 * Logs match score history entries if a student's profile update changes their match scores.
 * @param {Object} oldProfile The profile before updates
 * @param {Object} newProfile The profile after updates
 * @param {String} reason The audit reason
 */
export const logStudentMatchAudit = async (oldProfile, newProfile, reason) => {
  try {
    const companies = await Company.find({});
    const historyEntries = [];

    companies.forEach((company) => {
      const oldMatch = calculateMatchScore(oldProfile, company);
      const newMatch = calculateMatchScore(newProfile, company);

      if (oldMatch.totalMatchScore !== newMatch.totalMatchScore) {
        historyEntries.push({
          student: newProfile._id,
          company: company._id,
          previousScore: oldMatch.totalMatchScore,
          newScore: newMatch.totalMatchScore,
          reason,
          changedAt: new Date(),
        });
      }
    });

    if (historyEntries.length > 0) {
      await MatchScoreHistory.insertMany(historyEntries);
    }
  } catch (error) {
    console.error("Failed to log match score audit:", error);
  }
};

/**
 * Logs match score history entries if a company update changes student match scores.
 * @param {Object} oldCompany The company before updates
 * @param {Object} newCompany The company after updates
 * @param {String} reason The audit reason
 */
export const logCompanyMatchAudit = async (oldCompany, newCompany, reason) => {
  try {
    const profiles = await StudentProfile.find({});
    const historyEntries = [];

    profiles.forEach((profile) => {
      const oldMatch = calculateMatchScore(profile, oldCompany);
      const newMatch = calculateMatchScore(profile, newCompany);

      if (oldMatch.totalMatchScore !== newMatch.totalMatchScore) {
        historyEntries.push({
          student: profile._id,
          company: newCompany._id,
          previousScore: oldMatch.totalMatchScore,
          newScore: newMatch.totalMatchScore,
          reason,
          changedAt: new Date(),
        });
      }
    });

    if (historyEntries.length > 0) {
      await MatchScoreHistory.insertMany(historyEntries);
    }
  } catch (error) {
    console.error("Failed to log company match score audit:", error);
  }
};
