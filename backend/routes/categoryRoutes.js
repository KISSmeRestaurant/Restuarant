import express from 'express';
import { admin } from '../middleware/admin.js';
import { 
  getCategories, 
  addCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', admin, upload.single('image'), addCategory); // Changed to handle file uploads
router.put('/:id', admin, upload.single('image'), updateCategory);
router.delete('/:id', admin, deleteCategory);

export default router;