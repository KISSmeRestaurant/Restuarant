// models/Food.js
import mongoose from 'mongoose';

// models/Food.js
const FoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    lowercase: true
  },
  foodType: {
    type: String,
    required: true,
    enum: ['veg', 'non-veg'],
    default: 'veg'
  },
  imageUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Food', FoodSchema);