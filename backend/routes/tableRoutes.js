import express from 'express';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { staff } from '../middleware/staff.js';
import {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  getAvailableTables,
  getOccupiedTables,
  updateTableStatus,
  assignOrderToTable,
  addItemsToTableOrder,
  getTableBill,
  freeTable
} from '../controllers/tableController.js';

const router = express.Router();

// Public routes (none for tables)

// Staff routes - can view and manage table status
router.get('/', auth, staff, getAllTables);
router.get('/available', auth, staff, getAvailableTables);
router.get('/occupied', auth, staff, getOccupiedTables);
router.get('/:id', auth, staff, getTableById);
router.get('/:id/bill', auth, staff, getTableBill);
router.patch('/:id/status', auth, staff, updateTableStatus);
router.patch('/:id/assign-order', auth, staff, assignOrderToTable);
router.patch('/:id/add-items', auth, staff, addItemsToTableOrder);
router.patch('/:id/free', auth, staff, freeTable);

// Admin routes - full CRUD operations
router.post('/', auth, admin, createTable);
router.patch('/:id', auth, admin, updateTable);
router.delete('/:id', auth, admin, deleteTable);

export default router;
