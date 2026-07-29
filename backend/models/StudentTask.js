import mongoose from "mongoose";

const studentTaskSchema = new mongoose.Schema(
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
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: ["Assignment", "Project", "Exam", "Placement Prep", "Personal Study", "General"],
      default: "General",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    estimatedDurationMinutes: {
      type: Number,
      default: 60,
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
    placementImpact: {
      type: Number, // 1 to 10 scale
      default: 5,
    },
    source: {
      type: String,
      enum: ["manual", "ai_generated"],
      default: "manual",
    },
  },
  {
    timestamps: true,
  }
);

const StudentTask = mongoose.model("StudentTask", studentTaskSchema);
export default StudentTask;
