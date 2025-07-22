// backend/middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

// Environment-based rate limiting configuration
const isDevelopment = process.env.NODE_ENV === 'development';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 20, // Much higher limit for development
  message: {
    error: 'Too many login attempts, please try again later',
    retryAfter: Math.ceil(15 * 60 / 60) // minutes
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req) => {
    if (isDevelopment) {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost');
    }
    return false;
  }
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 200, // Much higher limit for development
  message: {
    error: 'Too many requests from this IP, please try again later',
    retryAfter: Math.ceil(15 * 60 / 60) // minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin and staff routes
    if (req.path.startsWith('/api/staff') || req.path.startsWith('/api/admin')) {
      return true;
    }
    
    // Skip rate limiting for localhost in development
    if (isDevelopment) {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost');
    }
    
    return false;
  }
});

// Specific limiter for food-related endpoints with higher limits
export const foodApiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: isDevelopment ? 500 : 100, // Higher limits for food API
  message: {
    error: 'Too many food API requests, please try again later',
    retryAfter: Math.ceil(5 * 60 / 60) // minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isDevelopment) {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost');
    }
    return false;
  }
});
