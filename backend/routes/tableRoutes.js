import express from 'express';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { staff } from '../middleware/staff.js';
import { requireTableAccess } from '../middleware/staffPermissions.js';
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

// Staff routes - can view and manage table status (requires table access permission)
router.get('/', auth, staff, requireTableAccess, getAllTables);
router.get('/available', auth, staff, requireTableAccess, getAvailableTables);
router.get('/occupied', auth, staff, requireTableAccess, getOccupiedTables);
router.get('/:id', auth, staff, requireTableAccess, getTableById);
router.get('/:id/bill', auth, staff, requireTableAccess, getTableBill);
router.patch('/:id/status', auth, staff, requireTableAccess, updateTableStatus);
router.patch('/:id/assign-order', auth, staff, requireTableAccess, assignOrderToTable);
router.patch('/:id/add-items', auth, staff, requireTableAccess, addItemsToTableOrder);
router.patch('/:id/free', auth, staff, requireTableAccess, freeTable);

// Admin routes - full CRUD operations
router.post('/', auth, admin, createTable);
router.patch('/:id', auth, admin, updateTable);
router.delete('/:id', auth, admin, deleteTable);

export default router;
