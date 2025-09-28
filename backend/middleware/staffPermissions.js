import User from '../models/User.js';
import AppError from '../utils/appError.js';

// Middleware to check if staff has table access permission
export const requireTableAccess = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`TableAccess Check: User ${user.email} - Role: ${user.role}, TableAccess: ${user.permissions?.tableAccess}`);
    }

    // Admin always has access
    if (user.role === 'admin') {
      return next();
    }

    // Check if user is staff and has table access
    if (user.role === 'staff') {
      // Grant access to all staff members for now.
      return next();
    }

    return next(new AppError('You do not have permission to perform this action', 403));
  } catch (err) {
    console.error('Error in requireTableAccess middleware:', err);
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

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`DashboardAccess Check: User ${user.email} - Role: ${user.role}, DashboardAccess: ${user.permissions?.dashboardAccess}`);
    }

    // Admin always has access
    if (user.role === 'admin') {
      return next();
    }

    // Check if user is staff and has dashboard access
    if (user.role === 'staff') {
      // Grant access to all staff members for now.
      return next();
    }

    return next(new AppError('You do not have permission to perform this action', 403));
  } catch (err) {
    console.error('Error in requireDashboardAccess middleware:', err);
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

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`AnyStaffAccess Check: User ${user.email} - Role: ${user.role}, Permissions:`, user.permissions);
    }

    // Admin always has access
    if (user.role === 'admin') {
      return next();
    }

    // Check if user is staff and has any access
    if (user.role === 'staff') {
      // Ensure permissions object exists
      if (!user.permissions) {
        console.error(`Staff user ${user.email} has no permissions object`);
        return next(new AppError('Staff permissions not configured. Please contact administrator.', 403));
      }
      
      if (!user.permissions.tableAccess && !user.permissions.dashboardAccess) {
        console.log(`Staff user ${user.email} denied access - no permissions enabled`);
        return next(new AppError('You do not have permission to access staff features', 403));
      }
      
      return next();
    }

    return next(new AppError('You do not have permission to perform this action', 403));
  } catch (err) {
    console.error('Error in requireAnyStaffAccess middleware:', err);
    next(err);
  }
};
