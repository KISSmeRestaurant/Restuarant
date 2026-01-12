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
      // Convert buffer to base64 for Cloudinary
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'restaurant/foods',
        public_id: `food-${Date.now()}`,
      });
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

export const updateFoodItem = async (req, res) => {
  try {
    console.log('Update food item request received');
    console.log('Food ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User:', req.user?.email);

    const { name, description, price, category, foodType } = req.body;
    const foodId = req.params.id;

    if (!name || !price || !category || !foodType) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Find the existing food item
    const existingFood = await Food.findById(foodId);
    if (!existingFood) {
      console.log('Food item not found:', foodId);
      return res.status(404).json({ message: 'Food item not found' });
    }

    console.log('Existing food found:', existingFood.name);

    let imageUrl = existingFood.imageUrl; // Keep existing image by default

    // If a new image is uploaded, upload to cloudinary
    if (req.file) {
      console.log('New image uploaded, uploading to cloudinary');

      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'restaurant/foods',
        public_id: `food-${Date.now()}`,
      });
      imageUrl = result.secure_url;
    }

    // Update the food item
    const updatedFood = await Food.findByIdAndUpdate(
      foodId,
      {
        name,
        description,
        price,
        category: category.toLowerCase(),
        foodType,
        imageUrl
      },
      { new: true, runValidators: true }
    );

    console.log('Food item updated successfully:', updatedFood.name);
    res.json(updatedFood);
  } catch (err) {
    console.error('Error updating food item:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getFoodItemById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json(food);
  } catch (err) {
    console.error('Error fetching food item:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
