import express from "express";
import { getOwnProfile, updateOwnProfile } from "../controllers/studentController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all student routes
router.use(protect);

router.get("/profile", getOwnProfile);
router.put("/profile", updateOwnProfile);

export default router;
