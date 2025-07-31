import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './backend/models/User.js';
import bcrypt from 'bcryptjs';
import connectDB from './backend/config/db.js';

const createTestUser = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Test user data
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      phone: '1234567890',
      postcode: 'SW1A 1AA',
      role: 'user',
      termsAccepted: true,
      emailVerified: true
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
    } else {
      // Create new user
      const user = new User(userData);
      await user.save();
      console.log('Test user created successfully:', user.email);
    }

    process.exit(0);
  } catch (error) {
    console.error('Test user creation error:', error);
    process.exit(1);
  }
};

createTestUser();
