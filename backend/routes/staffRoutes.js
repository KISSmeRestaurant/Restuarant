import express from 'express';
import { auth } from '../middleware/auth.js';
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

// Staff profile - using auth middleware first, then staff check
router.get('/me', auth, staff, getStaffDetails);
router.put('/profile', auth, staff, updateStaffProfile);
router.put('/change-password', auth, staff, changeStaffPassword);

// Order management - requires dashboard access
router.get('/orders', auth, requireDashboardAccess, getStaffOrders);
router.put('/orders/:id/status', auth, requireDashboardAccess, updateOrderStatus);

// Reservation management - requires any staff access
router.get('/reservations', auth, requireAnyStaffAccess, getStaffReservations);
router.put('/reservations/:id/status', auth, requireAnyStaffAccess, updateReservationStatus);

// Customer feedback - requires any staff access
router.get('/feedback', auth, requireAnyStaffAccess, getCustomerFeedback);

// Shift management - requires any staff access
router.post('/shift/start', auth, requireAnyStaffAccess, startShift);
router.post('/shift/end', auth, requireAnyStaffAccess, endShift);
router.get('/shift/active', auth, requireAnyStaffAccess, getActiveShift);
router.get('/shift/history', auth, requireAnyStaffAccess, getStaffShiftHistory);
router.get('/shifts/history', auth, requireAnyStaffAccess, getStaffShiftHistory); // Alternative route for frontend compatibility

export default router;
