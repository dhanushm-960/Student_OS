import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    // Validate inputs
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required.");
    }

    // Check duplicate email
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User with this email already exists.");
    }

    // Create user (role defaults to 'student' if not specified or overrideable)
    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
    });

    if (user) {
      if (user.role === "student") {
        const depts = ["CSE", "IT", "Electronics", "Mechanical", "Civil"];
        const department = depts[Math.floor(Math.random() * depts.length)];
        const uniqueNumber = Math.floor(100 + Math.random() * 900);
        const rollNumber = `${department}22${uniqueNumber}`;

        await StudentProfile.create({
          user: user._id,
          rollNumber,
          department,
          year: 1,
          gpa: parseFloat((7.0 + Math.random() * 2.5).toFixed(2)),
          attendance: Math.floor(75 + Math.random() * 22),
          dsaProgress: Math.floor(30 + Math.random() * 40),
          projectsCompleted: Math.floor(Math.random() * 3),
          placementReadiness: Math.floor(30 + Math.random() * 40),
          goalProgress: Math.floor(40 + Math.random() * 30),
          riskLevel: "Low",
          university: "Atria University",
          degree: "B.Tech Computer Science",
          phone: "+91 98765 43210",
          location: "Bangalore, India",
          major: "Artificial Intelligence",
          completedCredits: 12,
          resumeVersion: "v1.0",
          aiRecommendations: [
            "Complete your onboarding profile",
            "Schedule a counseling session with your academic mentor",
            "Update your skills and resume in the planner portal"
          ]
        });
      }

      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data.");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required.");
    }

    // Find user
    const user = await User.findOne({ email });

    // Verify credentials
    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          email: user.email,
        },
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password.");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(404);
      throw new Error("User not found.");
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
