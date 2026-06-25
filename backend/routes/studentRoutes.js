import express from "express";
import { getOwnProfile, updateOwnProfile } from "../controllers/studentController.js";
import {
  getProgress,
  createAssignment, updateAssignment, deleteAssignment,
  createProject, updateProject, deleteProject,
  createCourse, updateCourse, deleteCourse,
  createGoal, updateGoal, deleteGoal,
  recalculatePlacement,
} from "../controllers/studentController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all student routes
router.use(protect);

// Profile
router.get("/profile", getOwnProfile);
router.put("/profile", updateOwnProfile);

// Progress (aggregated)
router.get("/progress", getProgress);

// Assignments CRUD
router.post("/assignments", createAssignment);
router.put("/assignments/:id", updateAssignment);
router.delete("/assignments/:id", deleteAssignment);

// Projects CRUD
router.post("/projects", createProject);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

// Courses CRUD
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

// Goals CRUD
router.post("/goals", createGoal);
router.put("/goals/:id", updateGoal);
router.delete("/goals/:id", deleteGoal);

// Placement Engine
router.post("/recalculate-placement", recalculatePlacement);

export default router;
