import mongoose from "mongoose";

const matchScoreHistorySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    previousScore: {
      type: Number,
      required: true,
    },
    newScore: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: ["resume_reanalyzed", "gpa_updated", "company_requirements_updated", "manual_recalculation"],
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

// We can index on student and company for faster lookups
matchScoreHistorySchema.index({ student: 1, company: 1 });

const MatchScoreHistory = mongoose.model("MatchScoreHistory", matchScoreHistorySchema);
export default MatchScoreHistory;
