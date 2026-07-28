import StudentTask from "../models/StudentTask.js";
import CalendarEvent from "../models/CalendarEvent.js";
import AiPlanHistory from "../models/AiPlanHistory.js";
import StudentProfile from "../models/StudentProfile.js";
import { runPlanningEngine } from "../utils/planningEngine.js";

// @desc    Get current student tasks and calendar events
// @route   GET /api/student/planner-data
// @access  Private
export const getPlannerData = async (req, res, next) => {
  try {
    const [tasks, events, planHistory, profile] = await Promise.all([
      StudentTask.find({ student: req.user._id }).sort({ dueDate: 1 }),
      CalendarEvent.find({ student: req.user._id }).sort({ dueDate: 1 }),
      AiPlanHistory.findOne({ student: req.user._id }).sort({ createdAt: -1 }),
      StudentProfile.findOne({ user: req.user._id })
    ]);

    res.json({
      success: true,
      tasks,
      events,
      planHistory: planHistory || null,
      studyStreak: profile?.studyStreak || { currentStreak: 0, longestStreak: 0, totalDaysCompleted: 0 }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create student task
// @route   POST /api/student/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, category, dueDate, estimatedDurationMinutes, priority, placementImpact } = req.body;
    if (!title || !dueDate) {
      res.status(400);
      throw new Error("Title and due date are required.");
    }

    const task = await StudentTask.create({
      student: req.user._id,
      title,
      category: category || "General",
      dueDate,
      estimatedDurationMinutes: Number(estimatedDurationMinutes) || 60,
      priority: priority || "Medium",
      placementImpact: Number(placementImpact) || 5,
      status: "Pending"
    });

    // Create a matching Calendar Event too for calendar integration
    await CalendarEvent.create({
      student: req.user._id,
      title,
      category: category === "General" ? "Personal Study" : category,
      dueDate,
      durationMinutes: Number(estimatedDurationMinutes) || 60,
      priority: priority || "Medium",
      status: "Pending",
      linkedId: task._id.toString()
    });

    // Event Trigger: Re-run Adaptive Planning Engine immediately
    await runPlanningEngine(req.user._id, "Task added event");

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status / details
// @route   PUT /api/student/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const task = await StudentTask.findOne({ _id: req.params.id, student: req.user._id });
    if (!task) {
      res.status(404);
      throw new Error("Task not found.");
    }

    const { title, status, priority, dueDate, estimatedDurationMinutes } = req.body;

    if (title !== undefined) task.title = title;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (estimatedDurationMinutes !== undefined) task.estimatedDurationMinutes = Number(estimatedDurationMinutes);

    await task.save();

    // Keep associated CalendarEvent in sync
    await CalendarEvent.findOneAndUpdate(
      { linkedId: task._id.toString(), student: req.user._id },
      {
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        durationMinutes: task.estimatedDurationMinutes
      }
    );

    // Gamification Streak Logic
    if (status === "Completed") {
      const taskDateStr = new Date(task.dueDate).toDateString();
      const startOfDay = new Date(task.dueDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(task.dueDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Check if all tasks for this day are completed
      const allTasksToday = await StudentTask.find({
        student: req.user._id,
        dueDate: { $gte: startOfDay, $lte: endOfDay }
      });

      const allCompleted = allTasksToday.every(t => t.status === "Completed");

      if (allCompleted && allTasksToday.length > 0) {
        const profile = await StudentProfile.findOne({ user: req.user._id });
        if (profile && profile.studyStreak) {
          const lastDateStr = profile.studyStreak.lastCompletedDate ? new Date(profile.studyStreak.lastCompletedDate).toDateString() : null;

          if (lastDateStr !== taskDateStr) {
            // It's a new day completed!
            const yesterday = new Date(startOfDay);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (lastDateStr === yesterdayStr) {
              profile.studyStreak.currentStreak += 1;
            } else {
              profile.studyStreak.currentStreak = 1;
            }

            if (profile.studyStreak.currentStreak > profile.studyStreak.longestStreak) {
              profile.studyStreak.longestStreak = profile.studyStreak.currentStreak;
            }

            profile.studyStreak.totalDaysCompleted += 1;
            profile.studyStreak.lastCompletedDate = startOfDay;
            await profile.save();
          }
        }
      }
    }

    // Event Trigger: Recalculate adaptive plan on task status or due date changes
    await runPlanningEngine(req.user._id, `Task status updated: ${status}`);

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student task
// @route   DELETE /api/student/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await StudentTask.findOneAndDelete({ _id: req.params.id, student: req.user._id });
    if (!task) {
      res.status(404);
      throw new Error("Task not found.");
    }

    // Delete linked CalendarEvent
    await CalendarEvent.deleteMany({ linkedId: task._id.toString(), student: req.user._id });

    // Event Trigger
    await runPlanningEngine(req.user._id, "Task deleted event");

    res.json({ success: true, message: "Task deleted." });
  } catch (error) {
    next(error);
  }
};

// @desc    Create manual Calendar Event
// @route   POST /api/student/calendar/events
// @access  Private
export const createCalendarEvent = async (req, res, next) => {
  try {
    const { title, category, dueDate, durationMinutes, priority } = req.body;
    if (!title || !category || !dueDate) {
      res.status(400);
      throw new Error("Title, category, and date are required.");
    }

    const event = await CalendarEvent.create({
      student: req.user._id,
      title,
      category,
      dueDate,
      durationMinutes: Number(durationMinutes) || 60,
      priority: priority || "Medium",
      status: "Pending"
    });

    await runPlanningEngine(req.user._id, "Exam / event date changed");

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Daily Study Schedule
// @route   POST /api/student/planner/generate-daily
// @access  Private
export const generateDailyScheduleController = async (req, res, next) => {
  try {
    const { targetDate } = req.body;
    const dateObj = targetDate ? new Date(targetDate) : new Date();

    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error("Profile not found.");
    }

    // Delete existing AI tasks for this date so we can cleanly regenerate
    await StudentTask.deleteMany({
      student: req.user._id,
      dueDate: { $gte: startOfDay, $lte: endOfDay },
      source: "ai_generated"
    });
    
    await CalendarEvent.deleteMany({
      student: req.user._id,
      dueDate: { $gte: startOfDay, $lte: endOfDay },
      source: "ai_generated"
    });

    const existingTasks = await StudentTask.find({
      student: req.user._id,
      dueDate: { $gte: startOfDay, $lte: endOfDay }
    });

    const { generateDailySchedule } = await import("../services/dailyScheduleService.js");
    const createdTasks = await generateDailySchedule(req.user._id, profile, existingTasks, dateObj);

    // Run planner engine to update the overall plan history
    await runPlanningEngine(req.user._id, "Daily AI schedule generated");

    res.json({ success: true, message: "Schedule generated.", tasks: createdTasks });
  } catch (error) {
    next(error);
  }
};
