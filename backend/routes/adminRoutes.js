import express from 'express';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/auth.js';
import { 
  getAdminDetails,
  getAllUsers,
  updateUserRole,
  updateStaffPermissions,
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

console.log('🔧 Setting up admin routes...');

// Protected admin routes - using auth middleware first, then admin check
router.get('/me', auth, admin, getAdminDetails);
console.log('✅ Admin route registered: GET /me');
router.get('/users', auth, admin, getAllUsers);
console.log('✅ Admin route registered: GET /users');
router.patch('/users/:id/role', auth, admin, updateUserRole);
console.log('✅ Admin route registered: PATCH /users/:id/role');

// Staff permissions route - ensure this is registered before other staff routes
router.patch('/staff/:id/permissions', auth, admin, updateStaffPermissions);
console.log('✅ Admin route registered: PATCH /staff/:id/permissions');

router.patch('/users/:userId/online-status', auth, admin, updateUserOnlineStatus);
console.log('✅ Admin route registered: PATCH /users/:userId/online-status');
router.delete('/users/:id', auth, admin, deleteUser);
console.log('✅ Admin route registered: DELETE /users/:id');

// Staff shift management routes
router.get('/staff-shifts', auth, admin, getAllStaffShifts);
router.get('/staff-shifts/stats', auth, admin, getStaffShiftStats);
router.get('/staff-shifts/monthly-earnings/:year/:month', auth, admin, getMonthlyEarnings);
router.get('/staff-shifts/:id', auth, admin, getStaffShiftById);
router.patch('/staff-shifts/:id', auth, admin, updateStaffShift);
router.delete('/staff-shifts/:id', auth, admin, deleteStaffShift);

// Staff salary rate route - moved here to avoid conflicts
router.patch('/staff/:id/salary-rate', auth, admin, updateStaffSalaryRate);
console.log('✅ Admin route registered: PATCH /staff/:id/salary-rate');

// Settings management routes
router.get('/settings', auth, admin, getSettings);
router.patch('/settings', auth, admin, updateSettings);
router.patch('/settings/restaurant', auth, admin, updateRestaurantInfo);
router.patch('/settings/business-hours', auth, admin, updateBusinessHours);
router.patch('/settings/tax', auth, admin, updateTaxSettings);
router.patch('/settings/payment', auth, admin, updatePaymentSettings);
router.patch('/settings/salary', auth, admin, updateSalarySettings);
router.post('/settings/calculate-totals', auth, admin, calculateOrderTotals);
router.post('/settings/reset', auth, admin, resetSettings);

// Order statistics routes
router.get('/orders/stats', auth, admin, getOrderStats);
router.get('/orders/analytics', auth, admin, getOrderAnalytics);

// Table management routes
router.get('/tables', auth, admin, getAllTables);
router.post('/tables', auth, admin, createTable);
router.patch('/tables/:id', auth, admin, updateTable);
router.delete('/tables/:id', auth, admin, deleteTable);
router.get('/tables/orders', auth, admin, getTableOrders);

export default router;
