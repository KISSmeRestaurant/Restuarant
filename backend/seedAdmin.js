import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';

const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Admin data
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@kissme.com',
      password: await bcrypt.hash('Admin@1234', 12),
      phone: '+1234567890',
      postcode: 'ADMIN001',
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      // Update existing admin
      const updatedAdmin = await User.findOneAndUpdate(
        { email: adminData.email },
        { $set: adminData },
        { new: true }
      );
      console.log('Admin user updated:', updatedAdmin);
    } else {
      // Create new admin
      const admin = new User(adminData);
      await admin.save();
      console.log('Admin user created:', admin);
    }

    process.exit(0);
  } catch (error) {
    console.error('Admin creation error:', error);
    process.exit(1);
  }
};

createAdmin();