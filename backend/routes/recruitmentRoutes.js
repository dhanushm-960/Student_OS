import express from "express";
import protect, { isAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import {
  createDrive,
  getAdminDrives,
  getApplicationsForDrive,
  updateApplicationStatus,
  getEligibleDrives,
  applyToDrive,
  uploadProof,
  getMyApplications
} from "../controllers/recruitmentController.js";

import fs from "fs";

const router = express.Router();

// Ensure external uploads directory exists to prevent crash
const uploadDir = path.join(process.cwd(), "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Saving to ../uploads/ outside watched backend dir
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Only JPG and PNG images are allowed!"), false);
    }
  }
});

// Admin Routes
router.post("/admin/drives", protect, isAdmin, createDrive);
router.get("/admin/drives", protect, isAdmin, getAdminDrives);
router.get("/admin/drives/:driveId/applications", protect, isAdmin, getApplicationsForDrive);
router.put("/admin/applications/:applicationId/status", protect, isAdmin, updateApplicationStatus);

// Student Routes
router.get("/student/drives", protect, getEligibleDrives);
router.get("/student/applications", protect, getMyApplications);
router.post("/student/drives/:driveId/apply", protect, applyToDrive);
router.post(
  "/student/applications/:applicationId/proof",
  protect,
  upload.single("proof"),
  uploadProof
);

export default router;
