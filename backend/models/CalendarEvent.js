import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Assignment", "Project", "Exam", "Placement Prep", "Personal Study", "Recruitment Drive"],
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 60, // in minutes
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Missed", "Rescheduled"],
      default: "Pending",
    },
    linkedId: {
      type: String, // references dynamic ID of assignment/project if linked
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);
export default CalendarEvent;
