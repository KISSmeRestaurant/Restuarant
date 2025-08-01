import express from 'express';
import { staff } from '../middleware/staff.js';
import { requireTableAccess, requireDashboardAccess, requireAnyStaffAccess } from '../middleware/staffPermissions.js';
import { 
  getStaffDetails,
  getStaffOrders,
  updateOrderStatus,
  getStaffReservations,
  updateReservationStatus,
  getCustomerFeedback,
  startShift,
  getActiveShift,
  endShift,
  getStaffShiftHistory,
  updateStaffProfile,
  changeStaffPassword
} from '../controllers/staffController.js';

const router = express.Router();

// Staff profile
router.get('/me', staff, getStaffDetails);
router.put('/profile', staff, updateStaffProfile);
router.put('/change-password', staff, changeStaffPassword);

// Order management
router.get('/orders', staff, getStaffOrders);
router.put('/orders/:id/status', staff, updateOrderStatus);

// Reservation management
router.get('/reservations', staff, getStaffReservations);
router.put('/reservations/:id/status', staff, updateReservationStatus);

// Customer feedback
router.get('/feedback', staff, getCustomerFeedback);

// Shift management
router.post('/shift/start', staff, startShift);
router.post('/shift/end', staff, endShift);
router.get('/shift/active', staff, getActiveShift);
router.get('/shift/history', staff, getStaffShiftHistory);
router.get('/shifts/history', staff, getStaffShiftHistory); // Alternative route for frontend compatibility

export default router;
