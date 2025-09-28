// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../config/constants.js';

export const auth = async (req, res, next) => {
  try {
    // 1) Get token
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3) Check if user exists and get fresh user data with all fields including permissions
    const currentUser = await User.findById(decoded.userId).select('+active');
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4) Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'User recently changed password! Please log in again.'
      });
    }

    // 5) Update user online status and last seen, then get the updated user data
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id, 
      {
        isOnline: true,
        lastSeen: new Date()
      },
      { 
        new: true,
        select: '+active' // Ensure we get all fields including active status
      }
    );

    // 6) Ensure we have the most up-to-date user data including role and permissions
    // This is crucial for staff role updates to take effect immediately
    req.user = updatedUser;
    
    // 7) Add debug logging for role/permission changes (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Auth: User ${updatedUser.email} - Role: ${updatedUser.role}, Permissions:`, updatedUser.permissions);
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Your session has expired! Please log in again.'
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please log in again.'
      });
    }
    next(err);
  }
};

export const admin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'You do not have permission to perform this action'
    });
  }
  next();
};