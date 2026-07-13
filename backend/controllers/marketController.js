import { MarketSummary } from "../models/MarketIntelligence.js";
import StudentProfile from "../models/StudentProfile.js";
import { syncMarketData, updateStudentInsights } from "../services/careerPulseService.js";

// @desc    Get live market intelligence dashboard data
// @route   GET /api/market/live
// @access  Private
export const getLiveMarket = async (req, res, next) => {
  try {
    const summary = await MarketSummary.findOne();
    if (!summary) {
      // If none exists, run the sync manually for the first time
      const newSummary = await syncMarketData();
      return res.json({ success: true, market: newSummary });
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

// @desc    Manually trigger the market sync (Admin or test purpose)
// @route   POST /api/market/sync
// @access  Private (Admin)
export const triggerMarketSync = async (req, res, next) => {
  try {
    const summary = await syncMarketData();
    await updateStudentInsights();
    res.json({ success: true, message: "Market data synced successfully.", summary });
  } catch (error) {
    next(error);
  }
};
