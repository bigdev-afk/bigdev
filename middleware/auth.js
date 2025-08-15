import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';

// In-memory token blacklist (use Redis/DB in production)
let tokenBlacklist = [];

// Middleware to check if token is blacklisted
export const checkBlacklist = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (token && tokenBlacklist.includes(token)) {
    return res.status(401).json({ msg: 'Token has been revoked' });
  }
  next();
};

// Protect middleware
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log('Decoded token:', decoded);

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Add token to blacklist on logout
export const logout = (token) => {
  tokenBlacklist.push(token);
};

export default { protect, checkBlacklist, logout };
