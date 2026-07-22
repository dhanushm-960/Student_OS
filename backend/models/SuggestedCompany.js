import mongoose from "mongoose";

const suggestedCompanySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    sourceLocation: {
      type: String,
      required: true,
    },
    timesSuggested: {
      type: Number,
      default: 1,
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

suggestedCompanySchema.index({ companyName: 1, sourceLocation: 1 }, { unique: true });

const SuggestedCompany = mongoose.model("SuggestedCompany", suggestedCompanySchema);
export default SuggestedCompany;
