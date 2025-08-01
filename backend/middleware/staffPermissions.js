import User from '../models/User.js';
import AppError from '../utils/appError.js';

// Middleware to check if staff has table access permission
export const requireTableAccess = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    // Admin always has access
    if (user.role === 'admin') {
      return next();
    }

    // Check if user is staff and has table access
    if (user.role === 'staff') {
      if (!user.permissions || !user.permissions.tableAccess) {
        return next(new AppError('You do not have permission to access table management', 403));
      }
      return next();
    }

    return next(new AppError('You do not have permission to perform this action', 403));
  } catch (err) {
    next(err);
  }
};

// Middleware to check if staff has dashboard access permission
export const requireDashboardAccess = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    // Admin always has access
    if (user.role === 'admin') {
      return next();
    }

    // Check if user is staff and has dashboard access
    if (user.role === 'staff') {
      if (!user.permissions || !user.permissions.dashboardAccess) {
        return next(new AppError('You do not have permission to access kitchen dashboard', 403));
      }
      return next();
    }

    return next(new AppError('You do not have permission to perform this action', 403));
  } catch (err) {
    next(err);
  }
};

// Middleware to check if staff has either table or dashboard access
export const requireAnyStaffAccess = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    // Admin always has access
    if (user.role === 'admin') {
      return next();
    }

    // Check if user is staff and has any access
    if (user.role === 'staff') {
      if (!user.permissions || (!user.permissions.tableAccess && !user.permissions.dashboardAccess)) {
        return next(new AppError('You do not have permission to access staff features', 403));
      }
      return next();
    }

    return next(new AppError('You do not have permission to perform this action', 403));
  } catch (err) {
    next(err);
  }
};
