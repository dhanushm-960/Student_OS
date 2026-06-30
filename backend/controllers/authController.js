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
        const uniqueNumber = Math.floor(100 + Math.random() * 900);
        const rollNumber = `STU22${uniqueNumber}`;

        await StudentProfile.create({
          user: user._id,
          rollNumber,
          department: "CSE",
          year: 1,
          gpa: 0,
          attendance: 0,
          dsaProgress: 0,
          projectsCompleted: 0,
          placementReadiness: 0,
          goalProgress: 0,
          riskLevel: "Low",
          university: "Atria University",
          degree: "",
          phone: "",
          location: "",
          major: "",
          completedCredits: 0,
          resumeVersion: "v1.0",
          setupCompleted: false,
          aiRecommendations: [
            "Complete your onboarding profile"
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
          setupCompleted: false,
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
      const profile = user.role === "student"
        ? await StudentProfile.findOne({ user: user._id })
        : null;

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          email: user.email,
          setupCompleted: profile ? profile.setupCompleted : false,
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

    const profile = req.user.role === "student"
      ? await StudentProfile.findOne({ user: req.user._id })
      : null;

    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        setupCompleted: profile ? profile.setupCompleted : false,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
