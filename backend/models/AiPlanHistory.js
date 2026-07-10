import mongoose from "mongoose";

const aiPlanHistorySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalPlan: [
      {
        taskId: String,
        title: String,
        durationMinutes: Number,
        scheduledTime: Date,
      }
    ],
    updatedPlan: [
      {
        taskId: String,
        title: String,
        durationMinutes: Number,
        scheduledTime: Date,
      }
    ],
    completedTasks: [String], // array of taskId
    missedTasks: [String],
    rescheduledTasks: [String],
    reasoning: {
      type: String,
      default: "",
    },
    triggerEvent: {
      type: String,
      default: "Periodic recalculation",
    },
  },
  {
    timestamps: true,
  }
);

const AiPlanHistory = mongoose.model("AiPlanHistory", aiPlanHistorySchema);
export default AiPlanHistory;
