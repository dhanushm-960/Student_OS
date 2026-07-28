import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user details from the database without password
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User associated with this token no longer exists.",
        });
      }

      // Check if user changed password after the token was issued
      if (req.user.passwordChangedAt) {
        const changedTimestamp = parseInt(req.user.passwordChangedAt.getTime() / 1000, 10);
        if (decoded.iat < changedTimestamp) {
          return res.status(401).json({
            success: false,
            message: "User recently changed password. Please log in again.",
          });
        }
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token verification failed.",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided.",
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: "Not authorized as an admin",
    });
  }
};

export default protect;
