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
  getStaffShiftStats,
  getSettings,
  updateSettings,
  updateRestaurantInfo,
  updateBusinessHours,
  updateTaxSettings,
  updatePaymentSettings,
  calculateOrderTotals,
  resetSettings,
  getOrderStats,
  getOrderAnalytics
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

// Settings management routes
router.get('/settings', admin, getSettings);
router.patch('/settings', admin, updateSettings);
router.patch('/settings/restaurant', admin, updateRestaurantInfo);
router.patch('/settings/business-hours', admin, updateBusinessHours);
router.patch('/settings/tax', admin, updateTaxSettings);
router.patch('/settings/payment', admin, updatePaymentSettings);
router.post('/settings/calculate-totals', admin, calculateOrderTotals);
router.post('/settings/reset', admin, resetSettings);

// Order statistics routes
router.get('/orders/stats', admin, getOrderStats);
router.get('/orders/analytics', admin, getOrderAnalytics);

export default router;
