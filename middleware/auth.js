import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userSchema.js';

// In-memory token blacklist (for production use Redis or DB)
let tokenBlacklist = [];

// Middleware to check if token is blacklisted
const checkBlacklist = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (token && tokenBlacklist.includes(token)) {
    return res.status(401).json({ message: 'Token has been revoked' });
  }
  next();
};

// Protect middleware
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
});

// Logout function — adds token to blacklist
const logout = (token) => {
  tokenBlacklist.push(token);
};

// Export everything as named exports
export { protect, admin, checkBlacklist, logout };
