import StudentProfile from "../models/StudentProfile.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Project from "../models/Project.js";
import Goal from "../models/Goal.js";
import StudentTask from "../models/StudentTask.js";
import { buildStudentContext } from "../utils/contextBuilder.js";
import { analyzeResume, generateActionChecklist, generateRecommendation, chatWithMentor, generateWeeklySummary } from "../utils/aiService.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Helper: Deterministic placement predictor (NO AI)
const predictPlacementForStudent = async (profile) => {
  const gpa = profile.gpa || 0;
  const dsaProgress = profile.dsaProgress || 0;
  const projectsCount = profile.projectsCompleted || 0;
  const resumeScore = profile.resumeDetails?.score || 0;

  // Database checks
  const [completedTasks, projects] = await Promise.all([
    StudentTask.countDocuments({ student: profile.user, status: "Completed" }),
    Project.countDocuments({ student: profile.user }),
  ]);

  // Recruiter Match Scores calculation
  const companies = await Company.find({});
  let totalMatchScore = 0;
  companies.forEach(company => {
    let mScore = 0;
    if (profile.gpa >= company.minGpa) mScore += 30;
    else if (profile.gpa >= company.minGpa - 0.5) mScore += 15;
    
    let matchedSkillsCount = 0;
    const studentSkillsLower = (profile.skills || []).map(s => s.toLowerCase());
    if (company.requiredSkills && company.requiredSkills.length > 0) {
      company.requiredSkills.forEach(s => {
        if (studentSkillsLower.includes(s.toLowerCase())) matchedSkillsCount++;
      });
      mScore += (matchedSkillsCount / company.requiredSkills.length) * 40;
    } else {
      mScore += 40;
    }

    let matchedTechCount = 0;
    if (company.preferredTech && company.preferredTech.length > 0) {
      const studentTechLower = (profile.resumeDetails?.technologies || profile.resumeDetails?.technicalSkills || []).map(t => t.toLowerCase());
      company.preferredTech.forEach(t => {
        if (studentTechLower.includes(t.toLowerCase())) matchedTechCount++;
      });
      mScore += (matchedTechCount / company.preferredTech.length) * 30;
    } else {
      mScore += 30;
    }
    totalMatchScore += Math.min(100, mScore);
  });

  const avgMatchScore = companies.length > 0 ? (totalMatchScore / companies.length) : 0;

  // Compute a weighted score out of 100
  const resScore = (resumeScore / 100) * 25;
  const matchScoreWeight = (avgMatchScore / 100) * 25;
  const acadScore = ((gpa / 10) * 10) + ((dsaProgress / 100) * 10);
  const projScore = Math.min(15, (projectsCount + projects) * 5);
  const certsCount = profile.resumeDetails?.certifications?.length || 0;
  const consistencyScore = Math.min(10, completedTasks * 0.5) + Math.min(5, certsCount * 2.5);

  const finalScore = Math.round(resScore + matchScoreWeight + acadScore + projScore + consistencyScore);

  let potential = "Low";
  if (finalScore >= 75) potential = "High";
  else if (finalScore >= 50) potential = "Medium";

  const breakdown = [
    { label: "Resume Strength", value: Math.round((resScore/25)*100), max: 100, weight: "25%" },
    { label: "Recruiter Fit", value: Math.round((matchScoreWeight/25)*100), max: 100, weight: "25%" },
    { label: "Academic & DSA", value: Math.round((acadScore/20)*100), max: 100, weight: "20%" },
    { label: "Projects", value: Math.round((projScore/15)*100), max: 100, weight: "15%" },
    { label: "Task Consistency", value: Math.round((consistencyScore/15)*100), max: 100, weight: "15%" }
  ];

  const recs = [];
  if (resScore < 15) recs.push("Improve your Resume format and extractable skills.");
  if (matchScoreWeight < 15) recs.push("Acquire skills required by top matching companies.");
  if (acadScore < 10) recs.push("Work on CGPA and Data Structures.");
  if (projScore < 10) recs.push("Build more full-stack projects.");
  if (recs.length === 0) recs.push("Profile is strong! Focus on mock interviews.");

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

    // Call Gemini AI for extraction
    const extractedData = await analyzeResume(pdfText);

    const { technicalSkills, softSkills, programmingLanguages, frameworks, libraries, tools, databases, certifications, education, projects, experience, github, linkedin } = extractedData;
    const combinedSkills = [...new Set([...(technicalSkills||[]), ...(programmingLanguages||[]), ...(frameworks||[]), ...(tools||[]), ...(databases||[])])];

    // Deterministic Resume Scoring
    let score = 0;
    if (combinedSkills.length > 5) score += 20;
    else if (combinedSkills.length > 0) score += 10;
    
    if (projects && projects.length >= 2) score += 25;
    else if (projects && projects.length === 1) score += 15;

    if (experience && experience.length > 0) score += 20;
    if (education && education.length > 5) score += 10;
    if (github && github.length > 5) score += 15;
    if (linkedin && linkedin.length > 5) score += 10;

    score = Math.min(100, score);
    let strength = "Needs Work";
    if (score > 80) strength = "Strong";
    else if (score > 60) strength = "Average";

    // Call Gemini for Action Checklist
    const actionChecklist = await generateActionChecklist(extractedData, { studentProfile: profile });

    profile.resumeDetails = {
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
      actionChecklist,
      fileName,
      uploadedAt: new Date()
    };

    // Update main skills
    const existingSkillsSet = new Set(profile.skills || []);
    combinedSkills.forEach(s => existingSkillsSet.add(s));
    profile.skills = Array.from(existingSkillsSet);

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
      let score = 0;
      
      // 1. CGPA match (30%)
      const gpaDiff = profile.gpa - company.minGpa;
      let gpaScore = 0;
      if (gpaDiff >= 0) gpaScore = 30;
      else if (gpaDiff >= -0.5) gpaScore = 15; // close match

      // 2. Skills match (40%)
      let matchedSkills = [];
      let missingSkills = [];
      if (company.requiredSkills && company.requiredSkills.length > 0) {
        const studentSkillsLower = (profile.skills || []).map(s => s.toLowerCase());
        company.requiredSkills.forEach(s => {
          if (studentSkillsLower.includes(s.toLowerCase())) {
            matchedSkills.push(s);
          } else {
            missingSkills.push(s);
          }
        });
        score += (matchedSkills.length / company.requiredSkills.length) * 40;
      } else {
        score += 40; // free points if no requirements
      }

      // 3. Preferred tech match (30%)
      let matchedTech = [];
      if (company.preferredTech && company.preferredTech.length > 0) {
        const studentTechLower = (profile.resumeDetails?.technologies || profile.resumeDetails?.technicalSkills || []).map(t => t.toLowerCase());
        company.preferredTech.forEach(t => {
          if (studentTechLower.includes(t.toLowerCase())) {
            matchedTech.push(t);
            if (!matchedSkills.includes(t)) matchedSkills.push(t);
          } else {
            if (!missingSkills.includes(t)) missingSkills.push(t);
          }
        });
        score += (matchedTech.length / company.preferredTech.length) * 30;
      } else {
        score += 30;
      }

      const totalMatchScore = Math.min(100, Math.round(gpaScore + score));
      
      let recommendation = "Apply now!";
      if (missingSkills.length > 0) recommendation = `Acquire ${missingSkills[0]} to increase match score.`;
      if (gpaScore === 0) recommendation = `Increase GPA to meet the ${company.minGpa} cutoff.`;

      return {
        companyId: company._id,
        name: company.name,
        role: company.role,
        salary: company.salary,
        type: company.type,
        logo: company.logo,
        minGpa: company.minGpa,
        requiredSkills: company.requiredSkills,
        matchScore: totalMatchScore,
        eligible: profile.gpa >= company.minGpa,
        matchedSkills,
        missingSkills,
        recommendation
      };
    });

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      matches
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
    const { name, role, salary, type, minGpa, requiredSkills, preferredTech, logo } = req.body;
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
      logo: logo || "🏢"
    });

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
          dept: student.department,
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

// @desc    Get dynamic AI recommendations for the logged in student
// @route   GET /api/student/ai-recommendations
// @access  Private
export const getAiRecommendations = async (req, res, next) => {
  try {
    const context = await buildStudentContext(req.user._id);
    const recsResult = await generateRecommendation(context);

    res.json({
      success: true,
      currentReadiness: context.studentProfile.placementReadiness,
      predictedAfterCompletion: recsResult.predictedAfterCompletion,
      recommendations: recsResult.recommendations
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
