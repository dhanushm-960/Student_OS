import mongoose from "mongoose";

const applicationStatusHistorySchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

applicationStatusHistorySchema.index({ applicationId: 1 });

const ApplicationStatusHistory = mongoose.model("ApplicationStatusHistory", applicationStatusHistorySchema);
export default ApplicationStatusHistory;
