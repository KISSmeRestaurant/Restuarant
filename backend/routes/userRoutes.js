// routes/userRoutes.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { getCurrentUser, updateProfile } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', auth, getCurrentUser);
router.patch('/me', auth, updateProfile);

export default router;
