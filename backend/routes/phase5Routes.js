import express from "express";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import multer from "multer";
import {
  uploadResume,
  getRecruiterMatches,
  getCompanies,
  addCompany,
  getPlacementPredictions,
  getAiRecommendations,
  aiMentorChat,
  getWeeklySummary,
  getSkillGapAnalysis,
  getMatchScoreHistory
} from "../controllers/phase5Controller.js";

import { generateQuiz, submitQuiz } from "../controllers/quizController.js";
import { getLiveMarket, getPersonalizedMarket, triggerMarketSync, triggerMarketSyncOffline } from "../controllers/marketController.js";

const router = express.Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit, keep in memory

// Student Routes
router.post("/resume/upload", protect, upload.single("resume"), uploadResume);
router.get("/companies/matches", protect, getRecruiterMatches);
router.get("/match-history", protect, getMatchScoreHistory);
router.get("/student/ai-recommendations", protect, getAiRecommendations);
router.post("/student/ai-mentor/chat", protect, aiMentorChat);
router.get("/student/weekly-summary", protect, getWeeklySummary);
router.get("/student/skill-gaps", protect, getSkillGapAnalysis);
router.get("/student/quiz/generate", protect, generateQuiz);
router.post("/student/quiz/submit", protect, submitQuiz);

// Market Routes
router.get("/market/live", protect, getLiveMarket);
router.get("/market/personalized", protect, getPersonalizedMarket);
router.post("/market/sync", protect, admin, triggerMarketSync);

// Admin Routes
router.get("/admin/companies", protect, admin, getCompanies);
router.post("/admin/companies", protect, admin, addCompany);
router.get("/admin/placement-predictions", protect, admin, getPlacementPredictions);
router.post("/admin/refresh-market-data", protect, admin, triggerMarketSync);
router.post("/admin/refresh-market-data-offline", protect, admin, triggerMarketSyncOffline);

export default router;
