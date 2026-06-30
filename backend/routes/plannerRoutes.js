import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getPlannerData,
  createTask,
  updateTask,
  deleteTask,
  createCalendarEvent
} from "../controllers/plannerController.js";

const router = express.Router();

// Apply protect middleware
router.use(protect);

router.get("/planner-data", getPlannerData);
router.post("/tasks", createTask);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);
router.post("/calendar/events", createCalendarEvent);

export default router;
