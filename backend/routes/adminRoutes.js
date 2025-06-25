import express from 'express';
import { admin } from '../middleware/admin.js';
import { 
  getAdminDetails,
  getAllUsers,
  updateUserRole,
  deleteUser
} from '../controllers/adminController.js';

const router = express.Router();

// Protected admin routes
router.get('/me', admin, getAdminDetails);
router.get('/users', admin, getAllUsers);
router.patch('/users/:id/role', admin, updateUserRole);
router.delete('/users/:id', admin, deleteUser);

export default router;