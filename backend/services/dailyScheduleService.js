import { z } from "zod";
import { callAISafely } from "../utils/aiService.js";
import StudentTask from "../models/StudentTask.js";
import CalendarEvent from "../models/CalendarEvent.js";

const scheduleBlockSchema = z.object({
  schedule: z.array(z.object({
    title: z.string(),
    shortDescription: z.string(),
    startTime: z.string(), // "HH:mm"
    endTime: z.string(),   // "HH:mm"
    category: z.string(),
  }))
});

/**
 * Parses "HH:mm" to minutes since midnight for easy math
 */
const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Converts minutes since midnight back to "HH:mm"
 */
const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

/**
 * Fallback schedule generator if AI fails
 */
const generateFallbackSchedule = (timeWindows, prioritySkills) => {
  const schedule = [];
  let skillIndex = 0;

  timeWindows.forEach(window => {
    let startMins = timeToMinutes(window.startTime);
    const endMins = timeToMinutes(window.endTime);

    while (startMins + 60 <= endMins) { // 1-hour blocks
      const skill = prioritySkills[skillIndex % Math.max(1, prioritySkills.length)] || "General Study";
      
      schedule.push({
        title: `Study: ${skill}`,
        shortDescription: `Focused study session for ${skill}`,
        startTime: minutesToTime(startMins),
        endTime: minutesToTime(startMins + 60),
        category: "Personal Study"
      });

      startMins += 60;
      skillIndex++;
    }
  });

  return schedule;
};

export const generateDailySchedule = async (studentId, profile, existingTasks, targetDate) => {
  const { studyAvailability, skillGaps, careerGoal } = profile;
  
  if (!studyAvailability || !studyAvailability.timeWindows || studyAvailability.timeWindows.length === 0) {
    throw new Error("No study availability defined in profile.");
  }

  // Build context
  const prioritySkills = skillGaps?.prioritySkills || [];
  const existingScheduleStr = existingTasks.map(t => `- ${t.title} (Due/At: ${new Date(t.dueDate).toLocaleTimeString()})`).join("\n");
  const timeWindowsStr = studyAvailability.timeWindows.map(w => `${w.startTime} to ${w.endTime}`).join(", ");

  const systemPrompt = `You are an expert academic planner AI. Your job is to create a daily study schedule for a student.
Their career goal: ${careerGoal || "Software Engineer"}.
Their priority skill gaps: ${prioritySkills.join(", ") || "General programming concepts"}.

You must generate specific study blocks that fit strictly within the student's available time windows today:
${timeWindowsStr}

They already have the following tasks scheduled today. You MUST work around these and NOT schedule overlapping study blocks:
${existingScheduleStr || "None"}

Generate an array of study blocks. Ensure they fit the time windows and do not overlap.
Return the schedule strictly as a JSON object matching this exact structure:
{
  "schedule": [
    {
      "title": "String",
      "shortDescription": "String (A short personalized description of the session)",
      "startTime": "HH:mm",
      "endTime": "HH:mm",
      "category": "String (Must be one of: Assignment, Project, Exam, Placement Prep, Personal Study, General)"
    }
  ]
}
Do not include any markdown formatting, backticks, or extra text. Only return the JSON object.`;

  const userPrompt = "Generate my daily schedule for today based on my skill gaps and availability.";

  let generatedBlocks = [];

  try {
    const result = await callAISafely(systemPrompt, userPrompt, scheduleBlockSchema, null, { timeoutMs: 20000 });
    generatedBlocks = result.schedule;
  } catch (error) {
    console.error("❌ AI Schedule Generation Failed. Using rule-based fallback.", error);
    generatedBlocks = generateFallbackSchedule(studyAvailability.timeWindows, prioritySkills);
  }

  // Insert blocks into DB
  const createdTasks = [];
  const baseDate = new Date(targetDate);

  for (const block of generatedBlocks) {
    // Parse times and construct precise dates
    const [startH, startM] = block.startTime.split(":").map(Number);
    const [endH, endM] = block.endTime.split(":").map(Number);
    
    const blockDate = new Date(baseDate);
    blockDate.setHours(startH, startM, 0, 0);

    const durationMins = (endH * 60 + endM) - (startH * 60 + startM);

    const task = await StudentTask.create({
      student: studentId,
      title: block.title,
      description: block.shortDescription || "",
      category: ["Assignment", "Project", "Exam", "Placement Prep", "Personal Study", "General"].includes(block.category) ? block.category : "Personal Study",
      dueDate: blockDate,
      estimatedDurationMinutes: durationMins > 0 ? durationMins : 60,
      priority: "Medium",
      status: "Pending",
      placementImpact: 7, // AI tasks are important
      source: "ai_generated"
    });

    await CalendarEvent.create({
      student: studentId,
      title: block.title,
      description: block.shortDescription || "",
      category: ["Assignment", "Project", "Exam", "Placement Prep", "Personal Study", "Recruitment Drive"].includes(block.category) ? block.category : "Personal Study",
      dueDate: blockDate,
      durationMinutes: durationMins > 0 ? durationMins : 60,
      priority: "Medium",
      status: "Pending",
      linkedId: task._id.toString(),
      source: "ai_generated"
    });

    createdTasks.push(task);
  }

  return createdTasks;
};
