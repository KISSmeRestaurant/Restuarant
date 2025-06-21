// backend/middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later',
  skip: (req) => {
    return req.path.startsWith('/api/staff') || req.path.startsWith('/api/admin');
  }
});
