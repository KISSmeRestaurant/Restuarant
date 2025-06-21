import express from 'express';
import { admin } from '../middleware/admin.js';
import { 
  getFoodItems,
  addFoodItem,
  deleteFoodItem,
  getRecentFoodItems 
} from '../controllers/foodController.js';
import upload from '../middleware/upload.js';
import { getCategories } from '../controllers/categoryController.js';

const router = express.Router();

// GET all food items (public)
router.get('/', getFoodItems);

// POST new food item (admin only)
router.post('/', admin, upload.single('image'), addFoodItem);

// DELETE food item (admin only)
router.delete('/:id', admin, deleteFoodItem);

// routes/foodRoutes.js
router.post('/', admin, upload.single('image'), addFoodItem);

router.get('/categories', getCategories);

router.get('/recent', getRecentFoodItems);

export default router;