import express from 'express';
import { protect } from '../controllers/authController.js';
import User from '../models/User.js';

const router = express.Router();

// Get user data (GDPR right to access)
router.get('/my-data', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving your data'
    });
  }
});

// Delete account (GDPR right to be forgotten)
router.delete('/delete-account', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting your account'
    });
  }
});

// Update marketing preferences
router.patch('/update-marketing', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { marketingOptIn: req.body.marketingOptIn },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating marketing preferences'
    });
  }
});

export default router;