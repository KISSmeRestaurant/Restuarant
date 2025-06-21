// routes/adminRoutes.js
import express from 'express';
import { admin } from '../middleware/admin.js';
import { 
  getAdminDetails,
  getAllUsers,
  updateUserRole  // Add this import
} from '../controllers/adminController.js';

const router = express.Router();

// Protected admin routes
router.get('/me', admin, getAdminDetails);
router.get('/users', admin, getAllUsers);  // You might want to add this route too
router.patch('/users/:id/role', admin, updateUserRole);

export default router;