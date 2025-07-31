import express from 'express';
import { admin } from '../middleware/admin.js';
import { 
  getAdminDetails,
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateUserOnlineStatus,
  getAllStaffShifts,
  getStaffShiftById,
  updateStaffShift,
  deleteStaffShift,
  getStaffShiftStats,
  getMonthlyEarnings,
  getSettings,
  updateSettings,
  updateRestaurantInfo,
  updateBusinessHours,
  updateTaxSettings,
  updatePaymentSettings,
  updateSalarySettings,
  updateStaffSalaryRate,
  calculateOrderTotals,
  resetSettings,
  getOrderStats,
  getOrderAnalytics,
  getAllTables,
  createTable,
  updateTable,
  deleteTable,
  getTableOrders
} from '../controllers/adminController.js';

const router = express.Router();

// Protected admin routes
router.get('/me', admin, getAdminDetails);
router.get('/users', admin, getAllUsers);
router.patch('/users/:id/role', admin, updateUserRole);
router.patch('/users/:userId/online-status', admin, updateUserOnlineStatus);
router.delete('/users/:id', admin, deleteUser);

// Staff shift management routes
router.get('/staff-shifts', admin, getAllStaffShifts);
router.get('/staff-shifts/stats', admin, getStaffShiftStats);
router.get('/staff-shifts/monthly-earnings/:year/:month', admin, getMonthlyEarnings);
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
router.patch('/settings/salary', admin, updateSalarySettings);
router.patch('/staff/:id/salary-rate', admin, updateStaffSalaryRate);
router.post('/settings/calculate-totals', admin, calculateOrderTotals);
router.post('/settings/reset', admin, resetSettings);

// Order statistics routes
router.get('/orders/stats', admin, getOrderStats);
router.get('/orders/analytics', admin, getOrderAnalytics);

// Table management routes
router.get('/tables', admin, getAllTables);
router.post('/tables', admin, createTable);
router.patch('/tables/:id', admin, updateTable);
router.delete('/tables/:id', admin, deleteTable);
router.get('/tables/orders', admin, getTableOrders);

export default router;
