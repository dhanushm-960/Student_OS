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
    const [tasks, events, planHistory] = await Promise.all([
      StudentTask.find({ student: req.user._id }).sort({ dueDate: 1 }),
      CalendarEvent.find({ student: req.user._id }).sort({ dueDate: 1 }),
      AiPlanHistory.findOne({ student: req.user._id }).sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      tasks,
      events,
      planHistory: planHistory || null
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
