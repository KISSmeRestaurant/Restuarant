import express from 'express';
import {
  submitFeedback,
  getPublicFeedback,
  getAllFeedback,
  getFeedbackStats,
  respondToFeedback
} from '../controllers/feedbackController.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { staff } from '../middleware/staff.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/submit', submitFeedback);
router.get('/public', getPublicFeedback);

// Admin/Staff routes (authentication required)
router.get('/all', auth, staff, getAllFeedback);
router.get('/stats', auth, staff, getFeedbackStats);
router.patch('/:id/respond', auth, staff, respondToFeedback);

export default router;
