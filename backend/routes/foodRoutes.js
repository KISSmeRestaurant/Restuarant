import express from 'express';
import { admin } from '../middleware/admin.js';
import { 
  getFoodItems,
  addFoodItem,
  deleteFoodItem,
  getRecentFoodItems,
  updateFoodItem,
  getFoodItemById
} from '../controllers/foodController.js';
import upload from '../middleware/upload.js';
import { getCategories } from '../controllers/categoryController.js';

const router = express.Router();

// GET all food items (public)
router.get('/', getFoodItems);

// GET recent food items (public)
router.get('/recent', getRecentFoodItems);

// GET categories (public)
router.get('/categories', getCategories);

// POST new food item (admin only)
router.post('/', admin, upload.single('image'), addFoodItem);

// PUT update food item (admin only)
router.put('/:id', admin, upload.single('image'), updateFoodItem);

// DELETE food item (admin only)
router.delete('/:id', admin, deleteFoodItem);

// GET single food item by ID (public) - MUST be last to avoid conflicts
router.get('/:id', getFoodItemById);

export default router;
