import { MarketSummary } from "../models/MarketIntelligence.js";
import StudentProfile from "../models/StudentProfile.js";
import { syncMarketData, updateStudentInsights, syncMarketDataOffline } from "../services/careerPulseService.js";

// @desc    Get live market intelligence dashboard data
// @route   GET /api/market/live
// @access  Private
export const getLiveMarket = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    const location = profile?.location && profile.location.trim() !== "" ? profile.location : "Bangalore";
    
    let summary = await MarketSummary.findOne({ location });
    if (!summary) {
      // If none exists, try looking for Bangalore as a fallback, or run sync
      summary = await MarketSummary.findOne({ location: "Bangalore" });
      if (!summary) {
         // Should ideally not happen if sync is running
         return res.json({ success: true, market: null });
      }
    }
    res.json({ success: true, market: summary });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized market intelligence for the student
// @route   GET /api/market/personalized
// @access  Private
export const getPersonalizedMarket = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }
    res.json({ success: true, intelligence: profile.marketIntelligence });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually trigger the market sync with Adzuna
// @route   POST /api/market/sync
// @route   POST /api/admin/refresh-market-data
// @access  Private (Admin)
export const triggerMarketSync = async (req, res, next) => {
  try {
    const summaries = await syncMarketData();
    await updateStudentInsights();
    res.json({ success: true, message: "Live Market data synced successfully.", summaries });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually trigger the market sync offline (JSON)
// @route   POST /api/market/sync-offline
// @access  Private (Admin)
export const triggerMarketSyncOffline = async (req, res, next) => {
  try {
    const summaries = await syncMarketDataOffline();
    await updateStudentInsights();
    res.json({ success: true, message: "Offline Market data synced successfully.", summaries });
  } catch (error) {
    next(error);
  }
};
