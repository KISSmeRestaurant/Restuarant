import Category from '../models/Category.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim().toLowerCase();

    // Check for existing category
    const existingCategory = await Category.findOne({ 
      name: trimmedName 
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    let imageUrl = null;
    if (req.file) {
      try {
        // Convert buffer to base64 for Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'restaurant/categories',
          public_id: `cat-${Date.now()}`,
          overwrite: true
        });
        imageUrl = result.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr);
        return res.status(500).json({ message: 'Image upload failed' });
      }
    }

    const category = new Category({
      name: trimmedName,
      imageUrl
    });

    const savedCategory = await category.save();
    return res.status(201).json(savedCategory);

  } catch (err) {
    console.error('Category creation error:', err);
    return res.status(500).json({ 
      message: 'Failed to create category',
      error: err.message
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const categoryId = req.params.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim().toLowerCase();

    // Check for existing category
    const existingCategory = await Category.findOne({
      name: trimmedName,
      _id: { $ne: categoryId }
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already in use' });
    }

    // Get current category
    const currentCategory = await Category.findById(categoryId);
    if (!currentCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    let imageUrl = currentCategory.imageUrl;

    // Process new image if provided
    if (req.file) {
      try {
        // Delete old image from Cloudinary if exists
        if (currentCategory.imageUrl) {
          const publicId = currentCategory.imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`restaurant/categories/${publicId}`);
        }

        // Convert buffer to base64 for Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        // Upload new image directly from memory
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'restaurant/categories',
          public_id: `cat-${Date.now()}`,
          overwrite: true
        });
        
        imageUrl = result.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({ message: 'Image upload failed' });
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { 
        name: trimmedName,
        imageUrl
      },
      { new: true, runValidators: true }
    );

    res.json(updatedCategory);
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ 
      message: 'Failed to update category',
      error: err.message
    });
  }
};
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete image from Cloudinary if it exists
    if (category.imageUrl) {
      const publicId = category.imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`restaurant/categories/${publicId}`);
    }

    res.json({ 
      success: true,
      message: 'Category deleted successfully',
      deletedCategory: category
    });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};