// routes/authRoutes.js
import express from 'express';
import {
  signup,
  login,
  logout,
  sendOTP,
  verifyOTP,
  resetPasswordWithOTP,
  googleAuth,
  googleCallback,
  appwriteSync
} from '../controllers/authController.js';

const router = express.Router();

// Public Auth Routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password-otp', resetPasswordWithOTP);
router.get('/logout', logout);

// Google OAuth Routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Appwrite OAuth Sync Route
router.post('/appwrite-sync', appwriteSync);

export default router;
