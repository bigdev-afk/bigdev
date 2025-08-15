import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userSchema.js";

// In-memory token blacklist (for production, use Redis or DB)
let tokenBlacklist = [];

// Middleware to check if token is blacklisted
const checkBlacklist = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token && tokenBlacklist.includes(token)) {
    return res.status(401).json({ message: "Token has been revoked" });
  }
  next();
};

// Protect middleware: validate JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      // Check if token is blacklisted
      if (tokenBlacklist.includes(token)) {
        return res.status(401).json({ message: "Token has been revoked" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Auth error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
});

// Admin middleware: only allow admins
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
});

// Logout function: adds token to blacklist
const logout = (token) => {
  if (token && !tokenBlacklist.includes(token)) {
    tokenBlacklist.push(token);
  }
};

// Export all
export { protect, admin, checkBlacklist, logout };
