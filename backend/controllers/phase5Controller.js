import StudentProfile from "../models/StudentProfile.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Project from "../models/Project.js";
import Goal from "../models/Goal.js";

// Helper: Simple deterministic placement predictor
const predictPlacementForStudent = async (profile) => {
  // Pull dynamic count variables
  const gpa = profile.gpa || 0;
  const dsaProgress = profile.dsaProgress || 0;
  const attendance = profile.attendance || 0;
  const projectsCount = profile.projectsCompleted || 0;
  const resumeScore = profile.resumeDetails?.score || 0;

  // Let's count actual DB records for assignments/projects/goals for this user to combine
  const [assignments, projects, goals] = await Promise.all([
    Assignment.countDocuments({ student: profile.user }),
    Project.countDocuments({ student: profile.user }),
    Goal.countDocuments({ student: profile.user, completed: true }),
  ]);

  // Compute a weighted score out of 100
  // GPA (30% weight): gpa out of 10
  const gpaScore = (gpa / 10) * 30;
  // DSA (20% weight): progress out of 100
  const dsaScore = (dsaProgress / 100) * 20;
  // Projects (20% weight): based on count and resume projects
  const projScore = Math.min(20, (projectsCount + projects) * 4);
  // Resume (15% weight)
  const resScore = (resumeScore / 100) * 15;
  // Academic engagement (15% weight): attendance & completed goals
  const engScore = ((attendance / 100) * 10) + Math.min(5, goals * 1.5);

  const finalScore = Math.round(gpaScore + dsaScore + projScore + resScore + engScore);

  let potential = "Low";
  if (finalScore >= 75) potential = "High";
  else if (finalScore >= 50) potential = "Medium";

  // Generate recommendations
  const recs = [];
  if (gpa < 7.5) recs.push("Work on raising CGPA above 7.5 to meet recruiter cutoffs.");
  if (dsaProgress < 75) recs.push("Solve at least 50+ DSA problems on LeetCode/GeeksforGeeks to strengthen DSA index.");
  if (projectsCount < 3) recs.push("Add at least 1-2 robust full-stack or specialized AI/ML projects to your portfolio.");
  if (resumeScore < 70) recs.push("Upload an updated resume and resolve key parsing errors/grammar warnings.");
  if (attendance < 80) recs.push("Improve class attendance to stay above the 80% mark.");
  
  if (recs.length === 0) {
    recs.push("Profile is strong! Focus on mock interviews and system design prep.");
  }

  return { score: finalScore, potential, recs };
};

// @desc    Upload & Mock Analyze Resume
// @route   POST /api/student/resume/upload
// @access  Private
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Please upload a PDF resume file.");
    }

    const fileName = req.file.originalname;
    const fileBuffer = req.file.buffer;

    // Simulate PDF parsing
    // In real life: use pdf-parse, then regex match key sections or call an LLM API
    // We will extract mock details deterministically based on file contents, name, or student's current profile to feel highly realistic.
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    // Set up mock details
    const possibleSkills = [
      "React", "Node.js", "Express", "MongoDB", "Python", "Java", "C++", 
      "SQL", "HTML/CSS", "JavaScript", "Docker", "Git", "Machine Learning", 
      "Data Structures", "Algorithms", "TailwindCSS", "Next.js"
    ];

    // Pick 5-8 random skills
    const seed = fileName.length + req.user.name.length;
    const skillsCount = 5 + (seed % 4);
    const extractedSkills = [];
    for (let i = 0; i < skillsCount; i++) {
      const idx = (seed * (i + 1)) % possibleSkills.length;
      const sk = possibleSkills[idx];
      if (!extractedSkills.includes(sk)) extractedSkills.push(sk);
    }

    // Expose education & projects
    const extractedEducation = profile.degree || "Atria University - B.Tech CS";
    const extractedProjects = [
      "E-Commerce Microservices App",
      "AI Smart Camera Sentinel",
      "Dynamic Dashboard Portal"
    ].slice(0, 1 + (seed % 3));

    const extractedTech = extractedSkills.slice(0, Math.floor(extractedSkills.length / 2) + 1);

    // Dynamic Scoring
    let score = 60 + (seed % 31); // 60 to 90
    const suggestions = [];
    if (score < 75) {
      suggestions.push("Add more quantative metrics/impact numbers to your project descriptions.");
      suggestions.push("Ensure your LinkedIn profile URL is fully clickable and updated.");
    }
    if (!extractedSkills.includes("Algorithms") && !extractedSkills.includes("Data Structures")) {
      suggestions.push("Explicitly list Core CS Fundamentals (DSA, OOPs) in your skills section.");
    }
    if (extractedProjects.length < 2) {
      suggestions.push("Include a link to hosted projects alongside their GitHub repositories.");
    }
    if (suggestions.length === 0) {
      suggestions.push("Your resume looks great! Maintain clean formatting.");
    }

    // Save to MongoDB
    profile.resumeDetails = {
      score,
      skills: extractedSkills,
      education: extractedEducation,
      projects: extractedProjects,
      technologies: extractedTech,
      suggestions,
      fileName,
      uploadedAt: new Date()
    };

    // Update main skills if empty or extend
    const existingSkillsSet = new Set(profile.skills || []);
    extractedSkills.forEach(s => existingSkillsSet.add(s));
    profile.skills = Array.from(existingSkillsSet);

    // Re-run placement prediction since resume has updated!
    const prediction = await predictPlacementForStudent(profile);
    profile.placementPrediction = {
      potential: prediction.potential,
      score: prediction.score,
      recs: prediction.recs,
      lastCalculated: new Date()
    };
    profile.placementReadiness = prediction.score; // sync main readiness index

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
      const criteriaCount = 3; // CGPA, Skills, Preferred Tech
      
      // 1. CGPA match (30%)
      const gpaDiff = profile.gpa - company.minGpa;
      let gpaScore = 0;
      if (gpaDiff >= 0) gpaScore = 30;
      else if (gpaDiff >= -0.5) gpaScore = 15; // close match

      // 2. Skills match (40%)
      let skillsMatched = 0;
      if (company.requiredSkills && company.requiredSkills.length > 0) {
        const studentSkillsLower = (profile.skills || []).map(s => s.toLowerCase());
        company.requiredSkills.forEach(s => {
          if (studentSkillsLower.includes(s.toLowerCase())) {
            skillsMatched++;
          }
        });
        score += (skillsMatched / company.requiredSkills.length) * 40;
      } else {
        score += 40; // free points if no requirements
      }

      // 3. Preferred tech match (30%)
      let techMatched = 0;
      if (company.preferredTech && company.preferredTech.length > 0) {
        const studentTechLower = (profile.resumeDetails?.technologies || []).map(t => t.toLowerCase());
        company.preferredTech.forEach(t => {
          if (studentTechLower.includes(t.toLowerCase())) {
            techMatched++;
          }
        });
        score += (techMatched / company.preferredTech.length) * 30;
      } else {
        score += 30;
      }

      const totalMatchScore = Math.min(100, Math.round(gpaScore + score));
      
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
        eligible: profile.gpa >= company.minGpa
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
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    // Pull student indicators
    const currentReadiness = profile.placementReadiness || 0;
    const gpa = profile.gpa || 0;
    const dsaProgress = profile.dsaProgress || 0;
    const resumeScore = profile.resumeDetails?.score || 0;
    const skills = profile.skills || [];
    const careerGoal = profile.careerGoal || "Software Engineer";

    const allRecommendations = [];

    // Rule 1: Resume Score action
    if (resumeScore < 85) {
      const remainingResumeRoom = 85 - resumeScore;
      // Resume score is 25% of overall placement score. So improvement in resume score boosts readiness by:
      // readinessImprovement = (resumeScoreDiff) * 0.25
      const boost = Math.max(1, Math.round(remainingResumeRoom * 0.25));
      allRecommendations.push({
        title: "Improve your Resume",
        explanation: resumeScore === 0 
          ? "No analyzed resume on file. Upload your PDF resume to correct structural mistakes and parse skills."
          : "Add metrics, quantify achievements, and resolve action checklist items to optimize recruiter matching.",
        impact: boost
      });
    }

    // Rule 2: Projects completed action
    const actualProjects = await Project.countDocuments({ student: req.user._id });
    if (actualProjects < 3) {
      // Adding a project adds ~25 points to projectsScore (which is 25% of overall readiness).
      // So one extra project adds (25 * 0.25) = ~6-8%
      const boost = 6 + (2 - actualProjects) * 2;
      allRecommendations.push({
        title: `Complete a portfolio Project`,
        explanation: `Most recruiters hiring for '${careerGoal}' roles require hands-on experience. Build another full-stack app.`,
        impact: boost
      });
    }

    // Rule 3: DSA preparation
    if (dsaProgress < 80) {
      // DSA score is 30% of overall score. Raising dsaProgress to 85 adds to dsaScore.
      const boost = Math.max(1, Math.round((85 - dsaProgress) * 0.3));
      allRecommendations.push({
        title: "Practice DSA this week",
        explanation: "Enhance coding proficiency to pass coding assessments. Focus on arrays, hashing, and trees.",
        impact: boost
      });
    }

    // Rule 4: CGPA intervention
    if (gpa < 8.0) {
      // raising GPA is slow, but shows potential
      allRecommendations.push({
        title: "Enhance academic coursework grades",
        explanation: "Some premium recruiters enforce strict cut-offs at 8.0+ CGPA. Work closely with teaching assistants.",
        impact: 4
      });
    }

    // Pick top 3 recommendations sorted by highest impact
    const recommendations = allRecommendations
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3);

    // Fallbacks if profile is perfect
    if (recommendations.length < 3) {
      if (!recommendations.some(r => r.title.includes("Mock Interview"))) {
        recommendations.push({
          title: "Schedule a Mock Interview",
          explanation: "Maintain your edge by doing practice runs with career counselors or AI bots.",
          impact: 3
        });
      }
    }

    const totalBoost = recommendations.reduce((acc, curr) => acc + curr.impact, 0);
    const predictedAfterCompletion = Math.min(100, currentReadiness + totalBoost);

    res.json({
      success: true,
      currentReadiness,
      predictedAfterCompletion,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};
