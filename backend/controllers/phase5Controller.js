import StudentProfile from "../models/StudentProfile.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Project from "../models/Project.js";
import Goal from "../models/Goal.js";
import StudentTask from "../models/StudentTask.js";
import { buildStudentContext } from "../utils/contextBuilder.js";
import { analyzeResume, generateActionChecklist, chatWithMentor, generateWeeklySummary } from "../utils/aiService.js";
import { calculateMatchScore } from "../utils/matchScoring.js";
import { logStudentMatchAudit, logCompanyMatchAudit } from "../utils/auditTrail.js";
import MatchScoreHistory from "../models/MatchScoreHistory.js";
import { validateMatchesWithMarket } from "../services/marketValidationService.js";
import { MarketSummary } from "../models/MarketIntelligence.js";
import { fetchGithubStats } from "../services/githubService.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Helper: Deterministic placement predictor (NO AI)
const predictPlacementForStudent = async (profile) => {
  const gpa = profile.gpa || 0;
  const resumeScore = profile.resumeDetails?.score || 0;

  // Resume-extracted signals (these change per uploaded resume)
  const resumeProjects    = (profile.resumeDetails?.projects || []).length;
  const resumeExperience  = (profile.resumeDetails?.experience || []).length;
  const resumeCerts       = (profile.resumeDetails?.certifications || []).length;
  const resumeHasGitHub   = !!(profile.resumeDetails?.github);
  const resumeHasLinkedIn = !!(profile.resumeDetails?.linkedin);

  // DB signals
  const [completedTasks] = await Promise.all([
    StudentTask.countDocuments({ student: profile.user, status: "Completed" }),
  ]);

  // Recruiter match score (uses ONLY current resume skills - no stale profile.skills)
  const companies = await Company.find({});
  let totalMatchScore = 0;
  const mergedSkillsLower = [...new Set([
    ...(profile.resumeDetails?.technicalSkills || []),
    ...(profile.resumeDetails?.programmingLanguages || []),
    ...(profile.resumeDetails?.frameworks || []),
    ...(profile.resumeDetails?.tools || []),
    ...(profile.resumeDetails?.databases || []),
  ])].map(s => s.toLowerCase());
  companies.forEach(company => {
    let mScore = 0;
    if (gpa >= company.minGpa) mScore += 30;
    else if (gpa >= company.minGpa - 0.5) mScore += 15;

    if (company.requiredSkills && company.requiredSkills.length > 0) {
      const matched = company.requiredSkills.filter(s => mergedSkillsLower.includes(s.toLowerCase())).length;
      mScore += (matched / company.requiredSkills.length) * 40;
    } else {
      mScore += 40;
    }

    const studentTechLower = (profile.resumeDetails?.technicalSkills || []).map(t => t.toLowerCase());
    if (company.preferredTech && company.preferredTech.length > 0) {
      const matched = company.preferredTech.filter(t => studentTechLower.includes(t.toLowerCase())).length;
      mScore += (matched / company.preferredTech.length) * 30;
    } else {
      mScore += 30;
    }
    totalMatchScore += Math.min(100, mScore);
  });

  const avgMatchScore = companies.length > 0 ? (totalMatchScore / companies.length) : 0;

  // Weighted score (100 pts total):
  // Resume Quality    65% — primary differentiator, AI-graded
  // Recruiter Fit     15% — skills match against configured companies (resume skills only)
  // Academic          10% — GPA
  // Projects & Exp     7% — entries extracted from resume
  // Certs & Presence   3% — certifications, GitHub, LinkedIn

  const resScore   = (resumeScore / 100) * 65;
  const matchWt    = (avgMatchScore / 100) * 15;
  const acadScore  = (gpa / 10) * 10;

  const projAndExp = Math.min(7,
    Math.min(4, resumeProjects * 0.8) +
    Math.min(3, resumeExperience * 1.5)
  );

  const credScore = Math.min(3,
    Math.min(1.5, resumeCerts * 0.5) +
    (resumeHasGitHub ? 0.8 : 0) +
    (resumeHasLinkedIn ? 0.7 : 0)
  );

  const finalScore = Math.min(100, Math.round(resScore + matchWt + acadScore + projAndExp + credScore));

  let potential = "Low";
  if (finalScore >= 75) potential = "High";
  else if (finalScore >= 50) potential = "Medium";

  const breakdown = [
    { label: "Resume Strength",       value: resumeScore,                                max: 100, weight: "65%" },
    { label: "Recruiter Fit",         value: Math.round((matchWt / 15) * 100),           max: 100, weight: "15%" },
    { label: "Academic Performance",  value: Math.round((gpa / 10) * 100),               max: 100, weight: "10%" },
    { label: "Projects & Experience", value: Math.round((projAndExp / 7) * 100),         max: 100, weight: "7%"  },
    { label: "Certs & Presence",      value: Math.round((credScore / 3) * 100),          max: 100, weight: "3%"  },
  ];

  const recs = [];
  if (resScore < 40)      recs.push("Improve your resume quality - add measurable impact to your projects.");
  if (matchWt < 8)        recs.push("Acquire skills required by top matching companies.");
  if (acadScore < 7)      recs.push("Work on maintaining a higher CGPA.");
  if (resumeProjects < 2) recs.push("Build more projects and list them clearly in your resume.");
  if (!resumeHasGitHub)   recs.push("Add a GitHub profile link to your resume.");
  if (recs.length === 0)  recs.push("Profile is strong! Focus on mock interviews and targeting top companies.");

  return { score: finalScore, potential, recs, breakdown };
};

// @desc    Upload & Analyze Resume
// @route   POST /api/student/resume/upload
// @access  Private
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Please upload a PDF resume file.");
    }

    const fileName = req.file.originalname;
    
    // Use pdf-parse to extract real text from the PDF
    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text || "";

    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    const oldProfile = profile.toObject();

    // Deterministic check to ensure it's a resume using categories
    const lowerText = pdfText.toLowerCase();
    const categories = {
      education: ["education", "academic background", "academic qualifications"],
      experience: ["experience", "employment", "work history", "professional background"],
      skills: ["skills", "technologies", "technical skills", "core competencies"],
      projects: ["projects", "portfolio", "personal projects", "academic projects"],
      profile: ["profile", "summary", "objective", "about me", "github", "linkedin"]
    };

    let matchedCategories = 0;
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        matchedCategories++;
      }
    }

    // A real resume typically contains at least 3 of these structural sections (e.g. Education, Skills, Experience)
    if (matchedCategories < 3) {
      res.status(400);
      throw new Error("The uploaded document does not appear to be a valid resume. Please upload a real resume PDF.");
    }

    // Call Groq AI for extraction
    const extractedData = await analyzeResume(pdfText, profile);

    const { technicalSkills, softSkills, programmingLanguages, frameworks, libraries, tools, databases, certifications, education, projects, experience, github, linkedin } = extractedData;
    const combinedSkills = [...new Set([...(technicalSkills||[]), ...(programmingLanguages||[]), ...(frameworks||[]), ...(tools||[]), ...(databases||[])])];

    let githubStats = null;
    if (github) {
      githubStats = await fetchGithubStats(github);
    }

    // AI-driven Resume Scoring
    let score = extractedData.score || 50;
    let strength = extractedData.strength || "Needs Work";
    
    if (githubStats) {
       // Boost score if they have active repo count
       if (githubStats.reposCount >= 3) {
          score = Math.min(100, score + 5);
          strength = score > 80 ? "Strong" : score > 60 ? "Average" : "Needs Work";
       }
    }

    // Call Groq for Action Checklist
    const actionChecklistData = await generateActionChecklist(extractedData, { studentProfile: profile, githubStats });
    const finalChecklist = Array.isArray(actionChecklistData) ? actionChecklistData : [];

    profile.resumeDetails = {
      isFallback: extractedData.isFallback || false,
      score,
      strength,
      skills: combinedSkills,
      technicalSkills,
      softSkills,
      programmingLanguages,
      frameworks,
      libraries,
      tools,
      databases,
      certifications,
      education,
      projects,
      experience,
      github,
      linkedin,
      actionChecklist: finalChecklist,
      fileName,
      uploadedAt: new Date(),
      ...(githubStats && { githubStats })
    };

    // Replace skills from current resume (reset, not accumulate, so scores reflect THIS resume)
    profile.skills = combinedSkills;



    // Re-run placement prediction
    const prediction = await predictPlacementForStudent(profile);
    profile.placementPrediction = {
      potential: prediction.potential,
      score: prediction.score,
      recs: prediction.recs,
      breakdown: prediction.breakdown,
      lastCalculated: new Date()
    };
    profile.placementReadiness = prediction.score;

    // Reset skill verification because they uploaded a new resume
    if (profile.skillVerification) {
      profile.skillVerification.verified = false;
      profile.skillVerification.verifiedAt = null;
    } else {
      profile.skillVerification = { verified: false };
    }

    await logStudentMatchAudit(oldProfile, profile, "resume_reanalyzed");
    await profile.save();

    res.json({
      success: true,
      message: "Resume processed and saved successfully.",
      resumeDetails: profile.resumeDetails,
      placementPrediction: profile.placementPrediction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Recruiter Matching
// @route   GET /api/student/companies/matches
// @access  Private
export const getRecruiterMatches = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    const companies = await Company.find({});
    
    // Calculate match score for each company
    const matches = companies.map(company => {
      const matchData = calculateMatchScore(profile, company);
      
      // If suppressed based on soft GPA logic, return null
      if (matchData.isSuppressed) return null;

      return {
        companyId: company._id,
        name: company.name,
        role: company.role,
        salary: company.salary,
        type: company.type,
        logo: company.logo,
        minGpa: company.minGpa,
        requiredSkills: company.requiredSkills,
        matchScore: matchData.totalMatchScore,
        eligible: matchData.eligibilityTier === "eligible",
        eligibilityTier: matchData.eligibilityTier,
        matchedSkills: matchData.matchedSkills,
        missingSkills: matchData.missingSkills,
        recommendation: matchData.recommendation,
        majorFitTier: matchData.majorFitTier,
        majorFitNote: matchData.majorFitNote
      };
    }).filter(Boolean); // Filter out suppressed companies

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    let marketInsights = null;
    const location = profile.location || "Bangalore";
    const marketSummary = await MarketSummary.findOne({ location });
    
    if (marketSummary) {
      marketInsights = await validateMatchesWithMarket(profile, matches, marketSummary);
    }

    res.json({
      success: true,
      matches,
      marketInsights
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Skill Gap Analysis
// @route   GET /api/student/skill-gaps
// @access  Private
export const getSkillGapAnalysis = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    const companies = await Company.find({});
    
    // Aggregate missing skills across all companies to find highest priority ones
    const missingFrequency = {};
    companies.forEach(company => {
      const studentSkillsLower = (profile.skills || []).map(s => s.toLowerCase());
      
      const checkSkills = [...(company.requiredSkills || []), ...(company.preferredTech || [])];
      checkSkills.forEach(s => {
        if (!studentSkillsLower.includes(s.toLowerCase())) {
          if (!missingFrequency[s]) missingFrequency[s] = { count: 0, companies: [] };
          missingFrequency[s].count++;
          if (!missingFrequency[s].companies.includes(company.name)) {
            missingFrequency[s].companies.push(company.name);
          }
        }
      });
    });

    const missingSkillsArray = Object.keys(missingFrequency).map(skill => ({
      skill,
      requiredBy: missingFrequency[skill].companies,
      impact: missingFrequency[skill].count * 5, // Arbitrary impact score
      reason: `Required by ${missingFrequency[skill].companies.length} target companies`
    })).sort((a, b) => b.impact - a.impact).slice(0, 10); // Top 10

    profile.skillGaps = {
      missingSkills: missingSkillsArray,
      prioritySkills: missingSkillsArray.slice(0, 3).map(s => s.skill),
      lastCalculated: new Date()
    };

    await profile.save();

    res.json({
      success: true,
      currentSkills: profile.skills || [],
      skillGaps: profile.skillGaps
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Companies (Admin)
// @route   GET /api/admin/companies
// @access  Private/Admin
export const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({});
    res.json({
      success: true,
      companies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add Company (Admin)
// @route   POST /api/admin/companies
// @access  Private/Admin
export const addCompany = async (req, res, next) => {
  try {
    const { name, role, salary, type, minGpa, requiredSkills, preferredTech, logo, eligibleMajors, eligibleMinors } = req.body;
    if (!name || !role) {
      res.status(400);
      throw new Error("Company name and hiring role are required.");
    }

    const company = await Company.create({
      name,
      role,
      salary: salary || "TPA",
      type: type || "Dream",
      minGpa: Number(minGpa) || 0,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills || "").split(",").map(s => s.trim()).filter(Boolean),
      preferredTech: Array.isArray(preferredTech) ? preferredTech : (preferredTech || "").split(",").map(t => t.trim()).filter(Boolean),
      logo: logo || "🏢",
      eligibleMajors: eligibleMajors && eligibleMajors.length > 0 ? (Array.isArray(eligibleMajors) ? eligibleMajors : eligibleMajors.split(",").map(m => m.trim()).filter(Boolean)) : ["ALL"],
      eligibleMinors: eligibleMinors && eligibleMinors.length > 0 ? (Array.isArray(eligibleMinors) ? eligibleMinors : eligibleMinors.split(",").map(m => m.trim()).filter(Boolean)) : []
    });

    // An empty company object as "oldCompany" to force a match score diff (simulating going from 0 score to new score)
    const oldCompany = { minGpa: 10, requiredSkills: ["impossible_skill_xyz"], preferredTech: [] };
    await logCompanyMatchAudit(oldCompany, company, "company_requirements_updated");

    res.status(201).json({
      success: true,
      company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Placement Predictions Dashboard Data (Admin)
// @route   GET /api/admin/placement-predictions
// @access  Private/Admin
export const getPlacementPredictions = async (req, res, next) => {
  try {
    const students = await StudentProfile.find({}).populate("user", "name email");
    
    // For each student, re-calculate or retrieve predictions
    const predictions = await Promise.all(
      students.map(async (student) => {
        let prediction = student.placementPrediction;
        
        // If not calculated yet or default empty, predict now
        if (!prediction || prediction.score === 50) {
          const pred = await predictPlacementForStudent(student);
          student.placementPrediction = {
            potential: pred.potential,
            score: pred.score,
            recs: pred.recs,
            lastCalculated: new Date()
          };
          student.placementReadiness = pred.score; // keep in sync
          await student.save();
          prediction = student.placementPrediction;
        }

        return {
          studentId: student._id,
          name: student.user?.name || "Unknown Student",
          email: student.user?.email || "",
          roll: student.rollNumber,
          major: student.major,
          minor: student.minor,
          gpa: student.gpa,
          resumeScore: student.resumeDetails?.score || 0,
          readinessScore: prediction.score,
          potential: prediction.potential,
          recs: prediction.recs
        };
      })
    );

    // Grouping count for admin metrics
    const stats = {
      highCount: predictions.filter(p => p.potential === "High").length,
      mediumCount: predictions.filter(p => p.potential === "Medium").length,
      lowCount: predictions.filter(p => p.potential === "Low").length,
      averageReadiness: Math.round(predictions.reduce((acc, p) => acc + p.readinessScore, 0) / (predictions.length || 1))
    };

    res.json({
      success: true,
      stats,
      predictions
    });
  } catch (error) {
    next(error);
  }
};



// @desc    Get match score audit history for the student
// @route   GET /api/student/match-history
// @access  Private
export const getMatchScoreHistory = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }
    
    const history = await MatchScoreHistory.find({ student: profile._id })
      .populate("company", "name logo")
      .sort({ changedAt: -1 });

    res.json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Mentor Context-Aware Chat
// @route   POST /api/student/ai-mentor/chat
// @access  Private
export const aiMentorChat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400);
      throw new Error("Message is required.");
    }

    const context = await buildStudentContext(req.user._id);
    const reply = await chatWithMentor(context, message, history || []);

    res.json({
      success: true,
      reply
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get dynamic AI weekly summary for the logged in student
// @route   GET /api/student/weekly-summary
// @access  Private
export const getWeeklySummary = async (req, res, next) => {
  try {
    const context = await buildStudentContext(req.user._id);
    const summaryResult = await generateWeeklySummary(context);

    res.json({
      success: true,
      summary: summaryResult.summary,
      idealWorkloadHours: summaryResult.idealWorkloadHours,
      focusArea: summaryResult.focusArea
    });
  } catch (error) {
    next(error);
  }
};
