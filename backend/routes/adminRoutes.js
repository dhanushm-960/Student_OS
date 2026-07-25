import express from "express";
import { getDashboardStats, getStudents, getStudentById, createStudent, deleteStudent, getSuggestedCompanies } from "../controllers/adminController.js";
import { createAdminNotification } from "../controllers/notificationController.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

// Apply auth and role check middlewares to all routes
router.use(protect);
router.use(admin);

router.get("/dashboard-stats", getDashboardStats);
router.get("/students", getStudents);
router.post("/students", createStudent);
router.get("/students/:id", getStudentById);
router.delete("/students/:id", deleteStudent);
router.post("/notifications", createAdminNotification);
router.get("/suggested-companies", getSuggestedCompanies);

export default router;
