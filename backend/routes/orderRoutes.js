import express from 'express';
import { 
  createOrder,
  getOrders,
  updateOrderStatus,
  getUserOrders,
  getOrderById,
  cancelOrder
} from '../controllers/orderController.js';
import { auth as protect } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.get('/', protect, getOrders);
router.put('/:id/status', protect, updateOrderStatus);

// User routes
router.get('/my-orders', protect, getUserOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.post('/', protect, createOrder);

export default router;