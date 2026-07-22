import StudentProfile from "../models/StudentProfile.js";
import Project from "../models/Project.js";
import StudentTask from "../models/StudentTask.js";
import CalendarEvent from "../models/CalendarEvent.js";
import Company from "../models/Company.js";
import AiPlanHistory from "../models/AiPlanHistory.js";
import { calculateMatchScore } from "./matchScoring.js";

/**
 * Aggregates all student context from MongoDB to feed into the AI models.
 * Includes student profile, projects, matches, planner task states, calendar deadlines, and history.
 *
 * @param {string} userId The logged-in student user ID
 * @returns {Promise<object>} The aggregated Student Context object
 */
export const buildStudentContext = async (userId) => {
  const [profile, tasks, projects, calendarEvents, companies, planHistory] = await Promise.all([
    StudentProfile.findOne({ user: userId }).populate("user", "name email"),
    StudentTask.find({ student: userId }),
    Project.find({ student: userId }),
    CalendarEvent.find({ student: userId }),
    Company.find({}),
    AiPlanHistory.find({ student: userId }).sort({ createdAt: -1 }).limit(5)
  ]);

  if (!profile) {
    throw new Error("Student profile not found.");
  }

  // 1. Calculate recruiter match scores & missing skills dynamically
  const recruiterMatches = companies.map(company => {
    const matchData = calculateMatchScore(profile, company);
    return {
      companyId: company._id.toString(),
      name: company.name,
      role: company.role,
      salary: company.salary,
      minGpa: company.minGpa,
      matchScore: matchData.totalMatchScore,
      eligible: matchData.eligibilityTier === "eligible",
      eligibilityTier: matchData.eligibilityTier,
      missingSkills: matchData.missingSkills
    };
  });

  // 2. Classify tasks
  const now = new Date();
  const todayTasks = [];
  const upcomingTasks = [];
  const missedTasks = [];
  const completedTasks = [];

  tasks.forEach(t => {
    if (t.status === "Completed") {
      completedTasks.push({
        id: t._id.toString(),
        title: t.title,
        category: t.category,
        dueDate: t.dueDate,
        estimatedDurationMinutes: t.estimatedDurationMinutes,
        priority: t.priority,
        placementImpact: t.placementImpact
      });
    } else if (t.status === "Missed" || (t.dueDate < now && t.status !== "Completed")) {
      missedTasks.push({
        id: t._id.toString(),
        title: t.title,
        category: t.category,
        dueDate: t.dueDate,
        estimatedDurationMinutes: t.estimatedDurationMinutes,
        priority: t.priority,
        placementImpact: t.placementImpact
      });
    } else {
      // Determine if task is today
      const isToday = t.dueDate.toDateString() === now.toDateString();
      const taskObj = {
        id: t._id.toString(),
        title: t.title,
        category: t.category,
        dueDate: t.dueDate,
        estimatedDurationMinutes: t.estimatedDurationMinutes,
        priority: t.priority,
        placementImpact: t.placementImpact
      };
      if (isToday) {
        todayTasks.push(taskObj);
      } else {
        upcomingTasks.push(taskObj);
      }
    }
  });

  // 3. Classify calendar items
  const upcomingEvents = [];
  const assignments = [];
  const exams = [];
  const placementDrives = [];

  calendarEvents.forEach(e => {
    const eventObj = {
      id: e._id.toString(),
      title: e.title,
      dueDate: e.dueDate,
      durationMinutes: e.durationMinutes,
      status: e.status,
      priority: e.priority
    };

    if (e.category === "Assignment") {
      assignments.push(eventObj);
    } else if (e.category === "Exam") {
      exams.push(eventObj);
    } else if (e.category === "Placement Drive" || e.category === "Placement Prep") {
      placementDrives.push(eventObj);
    } else {
      upcomingEvents.push(eventObj);
    }
  });

  // Calculate available free time today (daily hours capacity - scheduled tasks)
  const dailyStudyCapacityMinutes = (profile.availableStudyHours || 4) * 60;
  const scheduledMinutes = todayTasks.reduce((acc, curr) => acc + (curr.estimatedDurationMinutes || 60), 0);
  const availableFreeTimeMinutes = Math.max(0, dailyStudyCapacityMinutes - scheduledMinutes);

  // 4. Map plan history
  const aiHistory = planHistory.map(h => ({
    id: h._id.toString(),
    reasoning: h.reasoning,
    triggerEvent: h.triggerEvent,
    originalPlan: h.originalPlan,
    updatedPlan: h.updatedPlan,
    completedCount: h.completedTasks?.length || 0,
    missedCount: h.missedTasks?.length || 0,
    createdAt: h.createdAt
  }));

  return {
    studentProfile: {
      userId: profile.user?._id?.toString(),
      name: profile.user?.name || "Student",
      email: profile.user?.email || "",
      year: profile.year,
      department: profile.department,
      degree: profile.degree || "B.Tech",
      major: profile.major || profile.department || "Computer Science",
      careerGoal: profile.careerGoal || "Software Engineer",
      gpa: profile.gpa,
      skills: profile.skills || [],
      resumeScore: profile.resumeDetails?.score || 0,
      placementReadiness: profile.placementReadiness || 0,
      studyPreferences: profile.studyPreferences || "Visual / Project-oriented",
      availableStudyHours: profile.availableStudyHours || 4,
      resumeDetails: profile.resumeDetails || {},
      skillGaps: profile.skillGaps || {}
    },
    projects: projects.map(p => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      status: p.status,
      progress: p.score || 0
    })),
    recruiterData: {
      matches: recruiterMatches
    },
    planner: {
      todayTasks,
      upcomingTasks,
      missedTasks,
      completedTasks
    },
    calendar: {
      upcomingEvents,
      assignments,
      exams,
      placementDrives,
      availableFreeTimeMinutes
    },
    aiHistory
  };
};
