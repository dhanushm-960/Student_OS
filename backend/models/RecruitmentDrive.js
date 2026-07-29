import mongoose from "mongoose";

const recruitmentDriveSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    roleTitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    eligibleMajors: {
      type: [String],
      default: ["ALL"],
    },
    eligibleMinors: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const RecruitmentDrive = mongoose.model("RecruitmentDrive", recruitmentDriveSchema);
export default RecruitmentDrive;
