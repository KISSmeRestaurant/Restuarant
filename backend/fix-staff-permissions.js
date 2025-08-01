import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-db';

async function fixStaffPermissions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all staff users
    const staffUsers = await User.find({ role: 'staff' });
    console.log(`Found ${staffUsers.length} staff users`);

    if (staffUsers.length === 0) {
      console.log('No staff users found to update');
      return;
    }

    // Update all staff users to have proper permissions
    const updateResult = await User.updateMany(
      { role: 'staff' },
      {
        $set: {
          'permissions.tableAccess': true,
          'permissions.dashboardAccess': true
        }
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} staff users with default permissions`);

    // Verify the updates
    const updatedStaff = await User.find({ role: 'staff' });
    console.log('\nUpdated staff permissions:');
    updatedStaff.forEach(staff => {
      console.log(`- ${staff.firstName} ${staff.lastName} (${staff.email}):`, {
        tableAccess: staff.permissions?.tableAccess || false,
        dashboardAccess: staff.permissions?.dashboardAccess || false
      });
    });

  } catch (error) {
    console.error('❌ Error fixing staff permissions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

fixStaffPermissions();
