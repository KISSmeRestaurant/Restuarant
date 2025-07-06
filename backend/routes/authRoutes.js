// routes/authRoutes.js
import express from 'express';
import {
  signup,
  login,
  logout,
  sendOTP,
  verifyOTP,
  resetPasswordWithOTP
} from '../controllers/authController.js';

const router = express.Router();

// Public Auth Routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password-otp', resetPasswordWithOTP);
router.get('/logout', logout);

export default router;