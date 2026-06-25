import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: ["CSE", "IT", "Electronics", "Mechanical", "Civil"],
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    gpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    attendance: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    dsaProgress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    projectsCompleted: {
      type: Number,
      required: true,
      min: 0,
    },
    placementReadiness: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    goalProgress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    aiRecommendations: {
      type: [String],
      default: [],
    },
    university: {
      type: String,
      default: "Atria University",
    },
    degree: {
      type: String,
      default: "B.Tech Computer Science",
    },
    phone: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    major: {
      type: String,
      default: "",
    },
    completedCredits: {
      type: Number,
      default: 0,
    },
    resumeVersion: {
      type: String,
      default: "v1.0",
    },
  },
  {
    timestamps: true,
  }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
export default StudentProfile;
