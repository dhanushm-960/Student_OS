import StudentProfile from "../models/StudentProfile.js";
import User from "../models/User.js";

// @desc    Get current student profile
// @route   GET /api/student/profile
// @access  Private
export const getOwnProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id }).populate(
      "user",
      "name email"
    );

    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    res.json({
      success: true,
      profile: {
        id: profile._id,
        name: profile.user?.name || "",
        email: profile.user?.email || "",
        roll: profile.rollNumber,
        dept: profile.department,
        year: profile.year,
        gpa: profile.gpa,
        attendance: profile.attendance,
        dsa: profile.dsaProgress,
        projects: profile.projectsCompleted,
        placement: profile.placementReadiness,
        goals: profile.goalProgress,
        risk: profile.riskLevel,
        university: profile.university,
        degree: profile.degree,
        phone: profile.phone,
        location: profile.location,
        major: profile.major,
        completedCredits: profile.completedCredits,
        resumeVersion: profile.resumeVersion,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current student profile
// @route   PUT /api/student/profile
// @access  Private
export const updateOwnProfile = async (req, res, next) => {
  const {
    name,
    university,
    degree,
    phone,
    location,
    major,
    completedCredits,
    gpa,
    projectsCompleted,
    placementReadiness,
    goalProgress,
    resumeVersion,
  } = req.body;

  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    // Update User model name if provided
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }

    // Update fields in StudentProfile
    if (university !== undefined) profile.university = university;
    if (degree !== undefined) profile.degree = degree;
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (major !== undefined) profile.major = major;
    if (completedCredits !== undefined) profile.completedCredits = Number(completedCredits);
    if (gpa !== undefined) profile.gpa = Number(gpa);
    if (projectsCompleted !== undefined) profile.projectsCompleted = Number(projectsCompleted);
    if (placementReadiness !== undefined) profile.placementReadiness = Number(placementReadiness);
    if (goalProgress !== undefined) profile.goalProgress = Number(goalProgress);
    if (resumeVersion !== undefined) profile.resumeVersion = resumeVersion;

    // Save updated profile
    await profile.save();

    // Reload with populated user fields
    const updated = await StudentProfile.findOne({ user: req.user._id }).populate(
      "user",
      "name email"
    );

    res.json({
      success: true,
      message: "Profile updated successfully.",
      profile: {
        id: updated._id,
        name: updated.user?.name || "",
        email: updated.user?.email || "",
        roll: updated.rollNumber,
        dept: updated.department,
        year: updated.year,
        gpa: updated.gpa,
        attendance: updated.attendance,
        dsa: updated.dsaProgress,
        projects: updated.projectsCompleted,
        placement: updated.placementReadiness,
        goals: updated.goalProgress,
        risk: updated.riskLevel,
        university: updated.university,
        degree: updated.degree,
        phone: updated.phone,
        location: updated.location,
        major: updated.major,
        completedCredits: updated.completedCredits,
        resumeVersion: updated.resumeVersion,
      },
    });
  } catch (error) {
    next(error);
  }
};
