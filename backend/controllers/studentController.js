import StudentProfile from "../models/StudentProfile.js";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Project from "../models/Project.js";
import Course from "../models/Course.js";
import Goal from "../models/Goal.js";

// @desc    Get current student profile
// @route   GET /api/student/profile
// @access  Private
export const getOwnProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id }).populate(
      "user",
      "name email"
    );

    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    res.json({
      success: true,
      profile: {
        id: profile._id,
        name: profile.user?.name || "",
        email: profile.user?.email || "",
        roll: profile.rollNumber,
        dept: profile.department,
        year: profile.year,
        gpa: profile.gpa,
        attendance: profile.attendance,
        dsa: profile.dsaProgress,
        projects: profile.projectsCompleted,
        placement: profile.placementReadiness,
        goals: profile.goalProgress,
        risk: profile.riskLevel,
        university: profile.university,
        degree: profile.degree,
        phone: profile.phone,
        location: profile.location,
        major: profile.major,
        completedCredits: profile.completedCredits,
        resumeVersion: profile.resumeVersion,
        careerGoal: profile.careerGoal || "",
        skills: profile.skills || [],
        linkedIn: profile.linkedIn || "",
        github: profile.github || "",
        placementBreakdown: profile.placementBreakdown || { resume: 0, projects: 0, dsa: 0, communication: 0 },
        setupCompleted: profile.setupCompleted || false,
        resumeDetails: profile.resumeDetails || { score: 0, skills: [], education: "", projects: [], technologies: [], suggestions: [], fileName: "" },
        placementPrediction: profile.placementPrediction || { potential: "Medium", score: 50, recs: [] },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current student profile
// @route   PUT /api/student/profile
// @access  Private
export const updateOwnProfile = async (req, res, next) => {
  const {
    name,
    university,
    degree,
    phone,
    location,
    major,
    completedCredits,
    gpa,
    projectsCompleted,
    placementReadiness,
    goalProgress,
    resumeVersion,
    careerGoal,
    skills,
    linkedIn,
    github,
    setupCompleted,
  } = req.body;

  try {
    let profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile) {
      const uniqueNumber = Math.floor(100 + Math.random() * 900);
      const rollNumber = `STU22${uniqueNumber}`;

      profile = new StudentProfile({
        user: req.user._id,
        rollNumber,
        department: "CSE",
        year: 1,
        gpa: 0,
        attendance: 0,
        dsaProgress: 0,
        projectsCompleted: 0,
        placementReadiness: 0,
        goalProgress: 0,
        riskLevel: "Low",
        university: "Atria University",
        degree: "",
        phone: "",
        location: "",
        major: "",
        completedCredits: 0,
        resumeVersion: "v1.0",
        setupCompleted: false,
      });
    }

    // Update User model name if provided
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }

    // Capture first-time onboarding flag
    const isFirstTimeOnboarding = setupCompleted && !profile.setupCompleted;

    // Update fields in StudentProfile
    if (university !== undefined) profile.university = university;
    if (degree !== undefined) {
      profile.degree = degree;
      const lowerDegree = degree.toLowerCase();
      if (lowerDegree.includes("computer") || lowerDegree.includes("data science") || lowerDegree.includes("software")) {
        profile.department = "CSE";
      } else if (lowerDegree.includes("information technology")) {
        profile.department = "IT";
      } else if (lowerDegree.includes("electronics")) {
        profile.department = "Electronics";
      } else if (lowerDegree.includes("mechanical")) {
        profile.department = "Mechanical";
      } else if (lowerDegree.includes("civil")) {
        profile.department = "Civil";
      }
    }
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (major !== undefined) profile.major = major;
    if (completedCredits !== undefined) profile.completedCredits = Number(completedCredits);
    if (gpa !== undefined) profile.gpa = Number(gpa);
    if (projectsCompleted !== undefined) profile.projectsCompleted = Number(projectsCompleted);
    if (placementReadiness !== undefined) profile.placementReadiness = Number(placementReadiness);
    if (goalProgress !== undefined) profile.goalProgress = Number(goalProgress);
    if (resumeVersion !== undefined) profile.resumeVersion = resumeVersion;
    if (careerGoal !== undefined) profile.careerGoal = careerGoal;
    if (linkedIn !== undefined) profile.linkedIn = linkedIn;
    if (github !== undefined) profile.github = github;
    if (studyPreferences !== undefined) profile.studyPreferences = studyPreferences;
    if (availableStudyHours !== undefined) profile.availableStudyHours = Number(availableStudyHours);
    if (setupCompleted !== undefined) profile.setupCompleted = !!setupCompleted;
    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        profile.skills = skills;
      } else if (typeof skills === "string") {
        profile.skills = skills.split(",").map(s => s.trim()).filter(Boolean);
      }
    }

    // Set metrics on onboarding completion
    if (isFirstTimeOnboarding) {
      profile.attendance = Math.floor(75 + Math.random() * 20);
      profile.dsaProgress = Math.floor(25 + Math.random() * 30);
      profile.goalProgress = Math.floor(30 + Math.random() * 30);

      const actualGpa = gpa !== undefined ? Number(gpa) : (profile.gpa || 0.0);
      const actualProjects = projectsCompleted !== undefined ? Number(projectsCompleted) : (profile.projectsCompleted || 0);

      const gpaWeight = actualGpa * 6;
      const projWeight = Math.min(20, actualProjects * 7);
      const dsaWeight = profile.dsaProgress * 0.2;
      profile.placementReadiness = Math.round(gpaWeight + projWeight + dsaWeight);

      profile.placementBreakdown = {
        resume: Math.floor(55 + Math.random() * 30),
        projects: Math.min(100, actualProjects * 30 + Math.floor(Math.random() * 20)),
        dsa: profile.dsaProgress,
        communication: Math.floor(60 + Math.random() * 30),
      };

      profile.aiRecommendations = [
        "Improve your Resume score by participating in hackathons",
        "Keep practicing DSA problems daily to boost your coding score",
        "Review your placement readiness with academic mentors"
      ];
    }

    // Save updated profile
    await profile.save();

    // Reload with populated user fields
    const updated = await StudentProfile.findOne({ user: req.user._id }).populate(
      "user",
      "name email"
    );

    res.json({
      success: true,
      message: "Profile updated successfully.",
      profile: {
        id: updated._id,
        name: updated.user?.name || "",
        email: updated.user?.email || "",
        roll: updated.rollNumber,
        dept: updated.department,
        year: updated.year,
        gpa: updated.gpa,
        attendance: updated.attendance,
        dsa: updated.dsaProgress,
        projects: updated.projectsCompleted,
        placement: updated.placementReadiness,
        goals: updated.goalProgress,
        risk: updated.riskLevel,
        university: updated.university,
        degree: updated.degree,
        phone: updated.phone,
        location: updated.location,
        major: updated.major,
        completedCredits: updated.completedCredits,
        resumeVersion: updated.resumeVersion,
        careerGoal: updated.careerGoal || "",
        skills: updated.skills || [],
        linkedIn: updated.linkedIn || "",
        github: updated.github || "",
        placementBreakdown: updated.placementBreakdown || { resume: 0, projects: 0, dsa: 0, communication: 0 },
        setupCompleted: updated.setupCompleted || false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────
// PHASE 4: STUDENT PROGRESS TRACKING
// ──────────────────────────────────────────────────

// @desc    Get aggregated progress (assignments, projects, courses, goals)
// @route   GET /api/student/progress
// @access  Private
export const getProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [assignments, projects, courses, goals] = await Promise.all([
      Assignment.find({ student: userId }).sort({ dueDate: 1 }),
      Project.find({ student: userId }).sort({ createdAt: -1 }),
      Course.find({ student: userId }).sort({ createdAt: -1 }),
      Goal.find({ student: userId }).sort({ createdAt: -1 }),
    ]);

    res.json({
      success: true,
      assignments,
      projects,
      courses,
      goals,
    });
  } catch (error) {
    next(error);
  }
};

// ── ASSIGNMENTS CRUD ──

// @desc    Create assignment
// @route   POST /api/student/assignments
// @access  Private
export const createAssignment = async (req, res, next) => {
  try {
    const { title, course, description, dueDate, status, priority } = req.body;
    if (!title || !course || !dueDate) {
      res.status(400);
      throw new Error("Title, course, and due date are required.");
    }
    const assignment = await Assignment.create({
      student: req.user._id,
      title,
      course,
      description: description || "",
      dueDate,
      status: status || "Not started",
      priority: priority || "Medium",
    });

    // Event Trigger: A new assignment is added
    try {
      const { runPlanningEngine } = await import("../utils/planningEngine.js");
      await runPlanningEngine(req.user._id, "New assignment added");
    } catch (peErr) {
      console.error("Failed to run planning engine on assignment create:", peErr);
    }

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assignment
// @route   PUT /api/student/assignments/:id
// @access  Private
export const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, student: req.user._id });
    if (!assignment) {
      res.status(404);
      throw new Error("Assignment not found.");
    }
    const { title, course, description, dueDate, status, priority } = req.body;
    if (title !== undefined) assignment.title = title;
    if (course !== undefined) assignment.course = course;
    if (description !== undefined) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = dueDate;
    if (status !== undefined) assignment.status = status;
    if (priority !== undefined) assignment.priority = priority;
    await assignment.save();

    // Event Trigger: Assignment status changes
    if (status !== undefined) {
      try {
        const { runPlanningEngine } = await import("../utils/planningEngine.js");
        await runPlanningEngine(req.user._id, `Assignment status updated: ${status}`);
      } catch (peErr) {
        console.error("Failed to run planning engine on assignment update:", peErr);
      }
    }

    res.json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/student/assignments/:id
// @access  Private
export const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, student: req.user._id });
    if (!assignment) {
      res.status(404);
      throw new Error("Assignment not found.");
    }

    // Event Trigger
    try {
      const { runPlanningEngine } = await import("../utils/planningEngine.js");
      await runPlanningEngine(req.user._id, "Assignment deleted");
    } catch (peErr) {
      console.error("Failed to run planning engine on assignment delete:", peErr);
    }

    res.json({ success: true, message: "Assignment deleted." });
  } catch (error) {
    next(error);
  }
};

// ── PROJECTS CRUD ──

// @desc    Create project
// @route   POST /api/student/projects
// @access  Private
export const createProject = async (req, res, next) => {
  try {
    const { title, description, tags, link, status, score } = req.body;
    if (!title) {
      res.status(400);
      throw new Error("Project title is required.");
    }
    const project = await Project.create({
      student: req.user._id,
      title,
      description: description || "",
      tags: Array.isArray(tags) ? tags : (typeof tags === "string" ? tags.split(",").map(t => t.trim()).filter(Boolean) : []),
      link: link || "",
      status: status || "Planning",
      score: Number(score) || 0,
    });

    // Update projects count on profile
    const count = await Project.countDocuments({ student: req.user._id });
    await StudentProfile.findOneAndUpdate({ user: req.user._id }, { projectsCompleted: count });

    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/student/projects/:id
// @access  Private
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, student: req.user._id });
    if (!project) {
      res.status(404);
      throw new Error("Project not found.");
    }
    const { title, description, tags, link, status, score } = req.body;
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (tags !== undefined) {
      project.tags = Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim()).filter(Boolean);
    }
    if (link !== undefined) project.link = link;
    if (status !== undefined) project.status = status;
    if (score !== undefined) project.score = Number(score);
    await project.save();
    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/student/projects/:id
// @access  Private
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, student: req.user._id });
    if (!project) {
      res.status(404);
      throw new Error("Project not found.");
    }
    // Update projects count on profile
    const count = await Project.countDocuments({ student: req.user._id });
    await StudentProfile.findOneAndUpdate({ user: req.user._id }, { projectsCompleted: count });

    res.json({ success: true, message: "Project deleted." });
  } catch (error) {
    next(error);
  }
};

// ── COURSES CRUD ──

// @desc    Create course
// @route   POST /api/student/courses
// @access  Private
export const createCourse = async (req, res, next) => {
  try {
    const { name, code, instructor, progress, grade, semester } = req.body;
    if (!name) {
      res.status(400);
      throw new Error("Course name is required.");
    }
    const course = await Course.create({
      student: req.user._id,
      name,
      code: code || "",
      instructor: instructor || "",
      progress: Number(progress) || 0,
      grade: grade || "",
      semester: semester || "",
    });
    res.status(201).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/student/courses/:id
// @access  Private
export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, student: req.user._id });
    if (!course) {
      res.status(404);
      throw new Error("Course not found.");
    }
    const { name, code, instructor, progress, grade, semester } = req.body;
    if (name !== undefined) course.name = name;
    if (code !== undefined) course.code = code;
    if (instructor !== undefined) course.instructor = instructor;
    if (progress !== undefined) course.progress = Number(progress);
    if (grade !== undefined) course.grade = grade;
    if (semester !== undefined) course.semester = semester;
    await course.save();
    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/student/courses/:id
// @access  Private
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, student: req.user._id });
    if (!course) {
      res.status(404);
      throw new Error("Course not found.");
    }
    res.json({ success: true, message: "Course deleted." });
  } catch (error) {
    next(error);
  }
};

// ── GOALS CRUD ──

// @desc    Create goal
// @route   POST /api/student/goals
// @access  Private
export const createGoal = async (req, res, next) => {
  try {
    const { title, description, type, progress, targetDate } = req.body;
    if (!title) {
      res.status(400);
      throw new Error("Goal title is required.");
    }
    const goal = await Goal.create({
      student: req.user._id,
      title,
      description: description || "",
      type: type || "General",
      progress: Number(progress) || 0,
      targetDate: targetDate || undefined,
      completed: false,
    });
    res.status(201).json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/student/goals/:id
// @access  Private
export const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, student: req.user._id });
    if (!goal) {
      res.status(404);
      throw new Error("Goal not found.");
    }
    const { title, description, type, progress, targetDate, completed } = req.body;
    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (type !== undefined) goal.type = type;
    if (progress !== undefined) goal.progress = Number(progress);
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (completed !== undefined) goal.completed = !!completed;
    if (goal.progress >= 100) goal.completed = true;
    await goal.save();

    // Recalculate overall goal progress on profile
    const allGoals = await Goal.find({ student: req.user._id });
    if (allGoals.length > 0) {
      const avgProgress = Math.round(allGoals.reduce((acc, g) => acc + g.progress, 0) / allGoals.length);
      await StudentProfile.findOneAndUpdate({ user: req.user._id }, { goalProgress: avgProgress });
    }

    res.json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/student/goals/:id
// @access  Private
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, student: req.user._id });
    if (!goal) {
      res.status(404);
      throw new Error("Goal not found.");
    }

    // Recalculate overall goal progress on profile
    const allGoals = await Goal.find({ student: req.user._id });
    const avgProgress = allGoals.length > 0
      ? Math.round(allGoals.reduce((acc, g) => acc + g.progress, 0) / allGoals.length)
      : 0;
    await StudentProfile.findOneAndUpdate({ user: req.user._id }, { goalProgress: avgProgress });

    res.json({ success: true, message: "Goal deleted." });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────
// PHASE 3: PLACEMENT READINESS ENGINE
// ──────────────────────────────────────────────────

// @desc    Recalculate placement readiness based on actual data
// @route   POST /api/student/recalculate-placement
// @access  Private
export const recalculatePlacement = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await StudentProfile.findOne({ user: userId });
    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    const [projectCount, goalsList] = await Promise.all([
      Project.countDocuments({ student: userId }),
      Goal.find({ student: userId }),
    ]);

    // Resume score: use parsed resume score if available, otherwise fallback to heuristics
    let resumeScore = profile.resumeDetails?.score || 0;
    if (resumeScore === 0) {
      resumeScore = 40;
      if (profile.skills && profile.skills.length > 0) resumeScore += Math.min(20, profile.skills.length * 5);
      if (profile.linkedIn) resumeScore += 10;
      if (profile.github) resumeScore += 10;
      if (profile.careerGoal) resumeScore += 10;
      if (profile.resumeVersion && profile.resumeVersion !== "v1.0") resumeScore += 10;
    }
    resumeScore = Math.min(100, resumeScore);

    // Projects score: based on actual project count
    const projectsScore = Math.min(100, projectCount * 25);

    // DSA score: already tracked
    const dsaScore = profile.dsaProgress || 0;

    // Communication score: composite of attendance + goal completion
    const avgGoalProgress = goalsList.length > 0
      ? Math.round(goalsList.reduce((acc, g) => acc + g.progress, 0) / goalsList.length)
      : 0;
    const communicationScore = Math.min(100, Math.round((profile.attendance * 0.4) + (avgGoalProgress * 0.3) + (profile.gpa * 3)));

    // Overall placement readiness: weighted average
    const overallPlacement = Math.round(
      (resumeScore * 0.25) +
      (projectsScore * 0.25) +
      (dsaScore * 0.30) +
      (communicationScore * 0.20)
    );

    profile.placementBreakdown = {
      resume: resumeScore,
      projects: projectsScore,
      dsa: dsaScore,
      communication: communicationScore,
    };
    profile.placementReadiness = overallPlacement;
    profile.projectsCompleted = projectCount;

    // Update risk level based on placement score
    if (overallPlacement >= 70) {
      profile.riskLevel = "Low";
    } else if (overallPlacement >= 45) {
      profile.riskLevel = "Medium";
    } else {
      profile.riskLevel = "High";
    }

    await profile.save();

    // Event Trigger: Placement readiness changes
    try {
      const { runPlanningEngine } = await import("../utils/planningEngine.js");
      await runPlanningEngine(userId, "Placement readiness changed");
    } catch (peErr) {
      console.error("Failed to run planning engine on placement recalculate:", peErr);
    }

    res.json({
      success: true,
      message: "Placement readiness recalculated.",
      placementReadiness: overallPlacement,
      placementBreakdown: profile.placementBreakdown,
      riskLevel: profile.riskLevel,
    });
  } catch (error) {
    next(error);
  }
};
