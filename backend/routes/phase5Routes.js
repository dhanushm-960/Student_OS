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
  aiMentorChat,
  getWeeklySummary,
  getSkillGapAnalysis,
  getMatchScoreHistory
} from "../controllers/phase5Controller.js";

import { generateQuiz, submitQuiz } from "../controllers/quizController.js";
import { getLiveMarket, triggerMarketSync, triggerMarketSyncOffline } from "../controllers/marketController.js";

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// Student Routes
router.post("/resume/upload", protect, upload.single("resume"), uploadResume);
router.get("/student/companies/matches", protect, getRecruiterMatches);
router.get("/student/match-history", protect, getMatchScoreHistory);
router.post("/student/ai-mentor/chat", protect, aiMentorChat);
router.get("/student/weekly-summary", protect, getWeeklySummary);
router.get("/student/skill-gaps", protect, getSkillGapAnalysis);
router.get("/student/quiz/generate", protect, generateQuiz);
router.post("/student/quiz/submit", protect, submitQuiz);

// Market Routes
router.get("/market/live", protect, getLiveMarket);
router.post("/market/sync", protect, admin, triggerMarketSync);

// Admin Routes
router.get("/admin/companies", protect, admin, getCompanies);
router.post("/admin/companies", protect, admin, addCompany);
router.get("/admin/placement-predictions", protect, admin, getPlacementPredictions);
router.post("/admin/refresh-market-data", protect, admin, triggerMarketSync);
router.post("/admin/refresh-market-data-offline", protect, admin, triggerMarketSyncOffline);

export default router;
