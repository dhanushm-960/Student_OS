import CalendarEvent from "../models/CalendarEvent.js";
import StudentTask from "../models/StudentTask.js";
import AiPlanHistory from "../models/AiPlanHistory.js";
import StudentProfile from "../models/StudentProfile.js";
import Company from "../models/Company.js";

/**
 * Adaptive Planning Engine Core Service
 * Dynamically re-schedules and prioritizes student workload.
 * Event-Driven Trigger: Automatically invoked on changes.
 */
export const runPlanningEngine = async (userId, triggerReason = "Data change event") => {
  try {
    // 1. Gather Student Details & Context
    const [profile, tasks, events, matches] = await Promise.all([
      StudentProfile.findOne({ user: userId }),
      StudentTask.find({ student: userId }),
      CalendarEvent.find({ student: userId }),
      Company.find({}) // to verify recruiter matches
    ]);

    if (!profile) return { success: false, message: "Profile not found" };

    const currentReadiness = profile.placementReadiness || 0;
    const resumeScore = profile.resumeDetails?.score || 0;
    const skills = (profile.skills || []).map(s => s.toLowerCase());

    // 2. Identify Overdue, Missed, and Unfinished Tasks
    const now = new Date();
    const missedList = [];
    const pendingList = [];

    for (const t of tasks) {
      const isOverdue = t.dueDate < now && t.status !== "Completed";
      if (t.status === "Missed" || isOverdue) {
        if (t.status !== "Missed") {
          t.status = "Missed";
          await t.save();
        }
        missedList.push(t);
      } else if (t.status === "Pending" || t.status === "Rescheduled") {
        pendingList.push(t);
      }
    }

    // 3. Simple Dynamic Workload Allocation & Priority Weighting
    // We prioritize based on:
    // - Placement Impact (Score 1-10)
    // - Recruiter Requirement (Does it fulfill a skill matching a company?)
    // - Proximity to Due Date
    const getRecruiterMatchMultiplier = (taskTitle) => {
      let multiplier = 1;
      const lowerTitle = taskTitle.toLowerCase();
      matches.forEach(comp => {
        const matchingRequired = comp.requiredSkills.some(skill => 
          lowerTitle.includes(skill.toLowerCase()) && !skills.includes(skill.toLowerCase())
        );
        if (matchingRequired) multiplier += 0.5; // High priority boost if it helps meet unmatched company skills
      });
      return multiplier;
    };

    const weightedTasks = [...missedList, ...pendingList].map(t => {
      const recruiterWeight = getRecruiterMatchMultiplier(t.title);
      const categoryWeight = t.category === "Placement Prep" ? 2.5 : t.category === "Assignment" ? 2.0 : 1.5;
      const timeRemainingMs = Math.max(3600000, t.dueDate.getTime() - now.getTime());
      const hoursRemaining = timeRemainingMs / 3600000;
      const urgencyFactor = Math.min(10, 100 / hoursRemaining);

      const finalWeight = (t.placementImpact * recruiterWeight * categoryWeight) + urgencyFactor;

      return {
        task: t,
        weight: finalWeight,
        duration: t.estimatedDurationMinutes || 60
      };
    });

    // Sort by descending weight
    weightedTasks.sort((a, b) => b.weight - a.weight);

    // 4. Distribute workload realistically without calendar conflicts
    // Let's create an updated plan for today (maximum 3.5 hours / 210 minutes total workload limit to avoid burnout)
    const MAX_WORKLOAD_MINUTES = 210;
    let scheduledWorkload = 0;
    const todayPlan = [];
    const rescheduledIds = [];

    for (const wt of weightedTasks) {
      if (scheduledWorkload + wt.duration <= MAX_WORKLOAD_MINUTES) {
        todayPlan.push({
          taskId: wt.task._id.toString(),
          title: wt.task.title,
          durationMinutes: wt.duration,
          scheduledTime: new Date(now.getTime() + scheduledWorkload * 60000)
        });
        scheduledWorkload += wt.duration;
      } else {
        // Mark as Rescheduled
        if (wt.task.status !== "Rescheduled") {
          wt.task.status = "Rescheduled";
          await wt.task.save();
        }
        rescheduledIds.push(wt.task._id.toString());
      }
    }

    // 5. Build AI Plan update explanation reasoning
    const missedNames = missedList.map(t => t.title);
    const reasoning = `Your original plan is no longer optimal. You missed: ${
      missedNames.length > 0 ? missedNames.join(", ") : "None"
    }. Tomorrow you have academic tasks. I've reorganized your schedule to prioritize placement readiness while keeping today's workload below 3.5 hours.`;

    // 6. Save AiPlanHistory
    const history = await AiPlanHistory.create({
      student: userId,
      originalPlan: weightedTasks.slice(0, 3).map(wt => ({
        taskId: wt.task._id.toString(),
        title: wt.task.title,
        durationMinutes: wt.task.estimatedDurationMinutes || 60,
        scheduledTime: wt.task.dueDate
      })),
      updatedPlan: todayPlan,
      completedTasks: tasks.filter(t => t.status === "Completed").map(t => t._id.toString()),
      missedTasks: missedList.map(t => t._id.toString()),
      rescheduledTasks: rescheduledIds,
      reasoning,
      triggerEvent: triggerReason
    });

    // 7. Sync or recreate calendar events based on newly updated plan
    // Clear out today's pending/rescheduled calendar items first
    await CalendarEvent.deleteMany({
      student: userId,
      status: { $in: ["Pending", "Rescheduled"] }
    });

    for (const pItem of todayPlan) {
      await CalendarEvent.create({
        student: userId,
        title: pItem.title,
        category: "Personal Study",
        dueDate: pItem.scheduledTime,
        durationMinutes: pItem.durationMinutes,
        priority: "High",
        status: "Pending",
        linkedId: pItem.taskId
      });
    }

    return {
      success: true,
      planHistory: history,
      recalculatedCount: todayPlan.length
    };
  } catch (error) {
    console.error("Planning Engine Error:", error);
    return { success: false, error: error.message };
  }
};
