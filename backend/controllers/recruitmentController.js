import RecruitmentDrive from "../models/RecruitmentDrive.js";
import Application from "../models/Application.js";
import ApplicationStatusHistory from "../models/ApplicationStatusHistory.js";
import Company from "../models/Company.js";
import StudentProfile from "../models/StudentProfile.js";
import { calculateMatchScore } from "../utils/matchScoring.js";
import fs from "fs";

// ---------------------- ADMIN CONTROLLERS ----------------------

// @desc    Create a Recruitment Drive
// @route   POST /api/admin/drives
// @access  Private/Admin
export const createDrive = async (req, res, next) => {
  try {
    const { companyId, roleTitle, description, deadline, eligibleMajors } = req.body;

    const drive = await RecruitmentDrive.create({
      companyId,
      roleTitle,
      description,
      deadline,
      eligibleMajors: eligibleMajors || ["ALL"],
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, drive });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all drives (Admin view)
// @route   GET /api/admin/drives
// @access  Private/Admin
export const getAdminDrives = async (req, res, next) => {
  try {
    const drives = await RecruitmentDrive.find({}).populate("companyId").sort({ createdAt: -1 });
    res.json({ success: true, drives });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for a drive
// @route   GET /api/admin/drives/:driveId/applications
// @access  Private/Admin
export const getApplicationsForDrive = async (req, res, next) => {
  try {
    const applications = await Application.find({ driveId: req.params.driveId })
      .populate({
        path: "studentId",
        populate: { path: "user", select: "name email" }
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/admin/applications/:applicationId/status
// @access  Private/Admin
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    const previousStatus = application.status;
    application.status = status;
    await application.save();

    // Log the status change
    await ApplicationStatusHistory.create({
      applicationId: application._id,
      previousStatus,
      newStatus: status,
      changedBy: req.user._id
    });

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

// ---------------------- STUDENT CONTROLLERS ----------------------

// @desc    Get eligible drives for the student
// @route   GET /api/student/drives
// @access  Private
export const getEligibleDrives = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    const drives = await RecruitmentDrive.find({ deadline: { $gte: new Date() } })
      .populate("companyId")
      .sort({ deadline: 1 });

    const processedDrives = drives.map(drive => {
      // Must ensure company is populated
      if (!drive.companyId) return null;

      const matchData = calculateMatchScore(profile, drive.companyId);
      
      return {
        ...drive.toObject(),
        isEligible: matchData.eligibilityTier === "eligible",
        ineligibilityReason: matchData.isSuppressed 
            ? "Your GPA does not meet the minimum tier requirements for this company."
            : (matchData.eligibilityTier !== "eligible" ? "Your skill match score is too low." : null),
        majorFitTier: matchData.majorFitTier,
        majorFitNote: matchData.majorFitNote
      };
    }).filter(Boolean);

    res.json({ success: true, drives: processedDrives });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications of the logged in student
// @route   GET /api/student/applications
// @access  Private
export const getMyApplications = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    const applications = await Application.find({ studentId: profile._id })
      .populate({
        path: "driveId",
        populate: { path: "companyId" }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply to a drive
// @route   POST /api/student/drives/:driveId/apply
// @access  Private
export const applyToDrive = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    const drive = await RecruitmentDrive.findById(req.params.driveId).populate("companyId");
    
    if (!drive) {
      res.status(404);
      throw new Error("Drive not found");
    }

    const matchData = calculateMatchScore(profile, drive.companyId);
    if (matchData.eligibilityTier !== "eligible" || matchData.isSuppressed) {
      res.status(403);
      throw new Error("You are not eligible to apply for this drive.");
    }

    // Attempt to create (unique index on studentId + driveId will catch duplicates)
    try {
      const application = await Application.create({
        studentId: profile._id,
        driveId: drive._id,
        status: "applied"
      });
      res.status(201).json({ success: true, application });
    } catch (err) {
      if (err.code === 11000) {
        res.status(400);
        throw new Error("You have already applied to this drive.");
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Upload application proof screenshot
// @route   POST /api/student/applications/:applicationId/proof
// @access  Private
export const uploadProof = async (req, res, next) => {
  try {
    const { stage } = req.body;
    
    if (!req.file) {
      res.status(400);
      throw new Error("No image file provided.");
    }

    if (!["applied", "interview", "offer_letter"].includes(stage)) {
      // Remove uploaded file if invalid stage
      fs.unlinkSync(req.file.path);
      res.status(400);
      throw new Error("Invalid stage provided.");
    }

    const profile = await StudentProfile.findOne({ user: req.user._id });
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      fs.unlinkSync(req.file.path);
      res.status(404);
      throw new Error("Application not found.");
    }

    if (application.studentId.toString() !== profile._id.toString()) {
      fs.unlinkSync(req.file.path);
      res.status(403);
      throw new Error("Unauthorized to modify this application.");
    }

    // construct public URL
    const fileUrl = `/uploads/${req.file.filename}`;

    application.proofs.push({
      stage,
      fileUrl,
      uploadedAt: new Date()
    });

    await application.save();

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};
