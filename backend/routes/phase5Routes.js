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
  getAiRecommendations
} from "../controllers/phase5Controller.js";

const router = express.Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit, keep in memory

// Student Routes
router.post("/resume/upload", protect, upload.single("resume"), uploadResume);
router.get("/companies/matches", protect, getRecruiterMatches);
router.get("/student/ai-recommendations", protect, getAiRecommendations);

// Admin Routes
router.get("/admin/companies", protect, admin, getCompanies);
router.post("/admin/companies", protect, admin, addCompany);
router.get("/admin/placement-predictions", protect, admin, getPlacementPredictions);

export default router;
