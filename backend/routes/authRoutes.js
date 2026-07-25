import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  googleSignIn,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleSignIn);

// Protected routes
router.get("/me", protect, getCurrentUser);

export default router;
