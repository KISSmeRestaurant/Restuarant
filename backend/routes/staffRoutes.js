import express from 'express';
import { staff } from '../middleware/staff.js';
import { 
  getStaffDetails,
  getStaffOrders,
  updateOrderStatus,
  getStaffReservations,  // This is the only import needed
  updateReservationStatus,
  getCustomerFeedback,
  startShift,
  endShift
} from '../controllers/staffController.js';

const router = express.Router();

// Staff profile
router.get('/me', staff, getStaffDetails);

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

export default router;