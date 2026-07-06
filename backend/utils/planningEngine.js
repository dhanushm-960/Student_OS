import CalendarEvent from "../models/CalendarEvent.js";
import StudentTask from "../models/StudentTask.js";
import AiPlanHistory from "../models/AiPlanHistory.js";
import { buildStudentContext } from "./contextBuilder.js";
import { generateDailyPlan } from "./aiService.js";

/**
 * Adaptive Planning Engine Core Service
 * Dynamically re-schedules and prioritizes student workload using AI.
 * Event-Driven Trigger: Automatically invoked on changes.
 */
export const runPlanningEngine = async (userId, triggerReason = "Data change event") => {
  try {
    console.log(`🧠 [Planning Engine] Running for student ${userId}. Trigger: "${triggerReason}"`);

    // 1. Gather Student Context from MongoDB
    const context = await buildStudentContext(userId);
    const now = new Date();

    // 2. Call AI daily planner module
    const planResult = await generateDailyPlan(context);
    const { reasoning, todayPlan, rescheduledTaskIds } = planResult;

    // 3. Persist status updates in database
    // Mark rescheduled tasks as "Rescheduled"
    if (rescheduledTaskIds && rescheduledTaskIds.length > 0) {
      await StudentTask.updateMany(
        { _id: { $in: rescheduledTaskIds }, student: userId },
        { status: "Rescheduled" }
      );
    }

    // Map plan to include scheduledTime
    const todayPlanWithTimes = (todayPlan || []).map((pItem, index) => {
      // Allocate task sequentially in free slots
      const duration = pItem.durationMinutes || 60;
      const scheduledTime = new Date(now.getTime() + index * duration * 60000);
      return {
        taskId: pItem.taskId,
        title: pItem.title,
        durationMinutes: duration,
        scheduledTime
      };
    });

    // 4. Save AiPlanHistory
    const allTasks = await StudentTask.find({ student: userId });
    const originalPlanMapped = allTasks
      .filter(t => t.status === "Pending")
      .slice(0, 3)
      .map(t => ({
        taskId: t._id.toString(),
        title: t.title,
        durationMinutes: t.estimatedDurationMinutes || 60,
        scheduledTime: t.dueDate
      }));

    const history = await AiPlanHistory.create({
      student: userId,
      originalPlan: originalPlanMapped,
      updatedPlan: todayPlanWithTimes,
      completedTasks: allTasks.filter(t => t.status === "Completed").map(t => t._id.toString()),
      missedTasks: allTasks.filter(t => t.status === "Missed").map(t => t._id.toString()),
      rescheduledTasks: rescheduledTaskIds || [],
      reasoning: reasoning || "Schedule updated by AI Mentor.",
      triggerEvent: triggerReason
    });

    // 5. Sync calendar items
    // Clear out today's pending/rescheduled calendar items first
    await CalendarEvent.deleteMany({
      student: userId,
      status: { $in: ["Pending", "Rescheduled"] }
    });

    // Create fresh calendar items matching updated AI plan
    for (const pItem of todayPlanWithTimes) {
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

    console.log(`✅ [Planning Engine] Successfully rescheduled ${todayPlanWithTimes.length} tasks.`);
    return {
      success: true,
      planHistory: history,
      recalculatedCount: todayPlanWithTimes.length
    };
  } catch (error) {
    console.error("❌ [Planning Engine] Error:", error);
    return { success: false, error: error.message };
  }
};
