import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    salary: {
      type: String,
      default: "TPA",
    },
    type: {
      type: String,
      enum: ["Dream", "Super Dream", "Mass Recruiter"],
      default: "Dream",
    },
    minGpa: {
      type: Number,
      default: 0,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    preferredTech: {
      type: [String],
      default: [],
    },
    logo: {
      type: String,
      default: "🏢",
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model("Company", companySchema);
export default Company;
