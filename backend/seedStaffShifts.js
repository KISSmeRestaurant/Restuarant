import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import StaffShift from './models/StaffShift.js';

dotenv.config();

const { MONGODB_URI } = process.env;

const seedStaffShifts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find staff users
    const staffUsers = await User.find({ role: 'staff' });
    
    if (staffUsers.length === 0) {
      console.log('No staff users found. Creating sample staff user...');
      
      // Create a sample staff user
      const staffUser = new User({
        firstName: 'John',
        lastName: 'Staff',
        email: 'staff@example.com',
        password: 'password123',
        role: 'staff',
        phone: '+1234567890'
      });
      
      await staffUser.save();
      staffUsers.push(staffUser);
      console.log('Sample staff user created');
    }

    // Clear existing staff shifts
    await StaffShift.deleteMany({});
    console.log('Cleared existing staff shifts');

    // Create sample staff shifts
    const sampleShifts = [];
    const now = new Date();
    
    for (let i = 0; i < 10; i++) {
      const startTime = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // i days ago
      const endTime = new Date(startTime.getTime() + (8 * 60 * 60 * 1000)); // 8 hours later
      const duration = 8 * 60; // 8 hours in minutes
      
      const shift = {
        staff: staffUsers[i % staffUsers.length]._id,
        startTime,
        endTime: i < 3 ? null : endTime, // First 3 shifts are active (no end time)
        duration: i < 3 ? null : duration,
        status: i < 3 ? 'active' : 'completed'
      };
      
      sampleShifts.push(shift);
    }

    await StaffShift.insertMany(sampleShifts);
    console.log(`Created ${sampleShifts.length} sample staff shifts`);

    console.log('Staff shifts seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding staff shifts:', error);
    process.exit(1);
  }
};

seedStaffShifts();
