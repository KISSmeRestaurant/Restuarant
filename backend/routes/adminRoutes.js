import express from 'express';
import { admin } from '../middleware/admin.js';
import { 
  getAdminDetails,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllStaffShifts,
  getStaffShiftById,
  updateStaffShift,
  deleteStaffShift,
  getStaffShiftStats
} from '../controllers/adminController.js';

const router = express.Router();

// Protected admin routes
router.get('/me', admin, getAdminDetails);
router.get('/users', admin, getAllUsers);
router.patch('/users/:id/role', admin, updateUserRole);
router.delete('/users/:id', admin, deleteUser);

// Staff shift management routes
router.get('/staff-shifts', admin, getAllStaffShifts);
router.get('/staff-shifts/stats', admin, getStaffShiftStats);
router.get('/staff-shifts/:id', admin, getStaffShiftById);
router.patch('/staff-shifts/:id', admin, updateStaffShift);
router.delete('/staff-shifts/:id', admin, deleteStaffShift);

export default router;
