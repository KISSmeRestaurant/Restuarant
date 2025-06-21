// routes/userRoutes.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { getCurrentUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', auth, getCurrentUser);

export default router;