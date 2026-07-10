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
      required: false,
      sparse: true,
      trim: true,
    },
    department: {
      type: String,
      required: false,
      enum: ["CSE", "IT", "Electronics", "Mechanical", "Civil"],
    },
    year: {
      type: Number,
      required: false,
      min: 1,
      max: 4,
      default: 1,
    },
    gpa: {
      type: Number,
      required: false,
      min: 0,
      max: 10,
      default: 0.0,
    },
    attendance: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
      default: 0,
    },
    dsaProgress: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
      default: 0,
    },
    projectsCompleted: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    placementReadiness: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
      default: 0,
    },
    goalProgress: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
      default: 0,
    },
    riskLevel: {
      type: String,
      required: false,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    careerGoal: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    linkedIn: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    placementBreakdown: {
      resume: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
      dsa: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
    },
    setupCompleted: {
      type: Boolean,
      default: false,
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
    resumeDetails: {
      score: { type: Number, default: 0 },
      strength: { type: String, default: "Needs Work" },
      skills: { type: [String], default: [] },
      technicalSkills: { type: [String], default: [] },
      softSkills: { type: [String], default: [] },
      programmingLanguages: { type: [String], default: [] },
      frameworks: { type: [String], default: [] },
      libraries: { type: [String], default: [] },
      tools: { type: [String], default: [] },
      databases: { type: [String], default: [] },
      certifications: { type: [String], default: [] },
      education: { type: String, default: "" },
      projects: { type: [String], default: [] },
      experience: { type: [String], default: [] },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      suggestions: { type: [String], default: [] },
      actionChecklist: { type: [String], default: [] },
      fileName: { type: String, default: "" },
      uploadedAt: { type: Date }
    },
    skillGaps: {
      missingSkills: [{
        skill: String,
        reason: String,
        requiredBy: [String],
        impact: Number
      }],
      prioritySkills: [String],
      lastCalculated: { type: Date, default: Date.now }
    },
    placementPrediction: {
      potential: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
      score: { type: Number, default: 50 },
      recs: { type: [String], default: [] },
      lastCalculated: { type: Date, default: Date.now }
    },
    studyPreferences: {
      type: String,
      default: "Visual / Project-oriented",
    },
    availableStudyHours: {
      type: Number,
      default: 4, // daily study hours
    }
  },
  {
    timestamps: true,
  }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
export default StudentProfile;
