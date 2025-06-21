import Food from '../models/Food.js';
import cloudinary from '../config/cloudinary.js';

export const addFoodItem = async (req, res) => {
  try {
    const { name, description, price, category, foodType } = req.body;
    
    if (!name || !price || !category || !foodType) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    let imageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const foodItem = new Food({
      name,
      description,
      price,
      category: category.toLowerCase(),
      foodType,
      imageUrl
    });

    await foodItem.save();
    res.status(201).json(foodItem);
  } catch (err) {
    console.error('Error adding food item:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
export const deleteFoodItem = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json({ message: 'Food item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
export const getFoodItems = async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// controllers/foodController.js
export const getRecentFoodItems = async (req, res) => {
  try {
    // Get the most recent 6 food items
    const foods = await Food.find()
      .sort({ createdAt: -1 }) // Sort by creation date (newest first)
      .limit(6); // Limit to 6 items
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};