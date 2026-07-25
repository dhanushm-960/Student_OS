import mongoose from "mongoose";

const marketSummarySchema = mongoose.Schema(
  {
    location: { type: String, required: true },
    country: { type: String, default: "IN" },
    topSkills: [
      {
        skill: String,
        count: Number,
        trend: { type: String, enum: ["up", "down", "stable"], default: "stable" }
      }
    ],
    topCompanies: [
      {
        name: String,
        count: Number
      }
    ],
    trendingRoles: [
      {
        role: String,
        count: Number
      }
    ],
    lastUpdated: { type: Date, default: Date.now },
    lastRefreshedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
  }
);

// We'll store a single document containing the summary to easily fetch for the dashboard
export const MarketSummary = mongoose.model("MarketSummary", marketSummarySchema);
