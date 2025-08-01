// controllers/staffController.js
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import Feedback from '../models/Feedback.js';
import StaffShift from '../models/StaffShift.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const getStaffDetails = async (req, res) => {
  try {
    const staff = req.user;
    
    res.status(200).json({
      status: 'success',
      data: {
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        role: staff.role,
        phone: staff.phone,
        permissions: staff.permissions || {
          tableAccess: true,
          dashboardAccess: true
        },
        createdAt: staff.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const getStaffOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['pending', 'preparing', 'ready'] }
    })
    .sort({ createdAt: -1 })
    .populate('items.food', 'name price')
    .populate('user', 'firstName lastName email phone');

    res.status(200).json({
      status: 'success',
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'preparing', 'ready', 'delivered'].includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid status specified'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
    .populate('items.food', 'name price')
    .populate('user', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: order
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const getStaffReservations = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's and future reservations
    const reservations = await Reservation.find({
      date: { $gte: today }
    })
    .sort({ date: 1, time: 1 })
    .populate('user', 'firstName lastName email phone');

    res.status(200).json({
      status: 'success',
      data: reservations
    });
  } catch (err) {
    console.error('Error fetching staff reservations:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reservations'
    });
  }
};

export const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid status specified'
      });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
    .populate('user', 'firstName lastName email phone');

    if (!reservation) {
      return res.status(404).json({
        status: 'fail',
        message: 'Reservation not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: reservation
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};


export const getCustomerFeedback = async (req, res) => {
  try {
    // Get feedback from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const feedback = await Feedback.find({
      createdAt: { $gte: sevenDaysAgo }
    })
    .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: feedback
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// In staffController.js - startShift function
export const startShift = async (req, res) => {
  try {
    const staffId = req.user._id;
    
    // Check for existing active shift
    const activeShift = await StaffShift.getActiveShift(staffId);
    
    if (activeShift) {
      // Return the existing active shift
      return res.status(200).json({
        status: 'success',
        data: {
          shift: activeShift,
          startTime: activeShift.startTime,
          message: 'Shift already active'
        }
      });
    }
    
    // Get default hourly rate from settings
    const Settings = (await import('../models/Settings.js')).default;
    const settings = await Settings.getSettings();
    const defaultHourlyRate = settings.salarySettings.defaultHourlyRate;
    
    // Create new shift if none exists
    const shift = await StaffShift.create({
      staff: staffId,
      startTime: new Date(),
      status: 'active',
      salary: {
        hourlyRate: defaultHourlyRate,
        totalEarned: 0
      }
    });
    
    const populatedShift = await StaffShift.findById(shift._id).populate('staff', 'firstName lastName email');
    
    res.status(201).json({
      status: 'success',
      data: {
        shift: populatedShift,
        startTime: populatedShift.startTime,
        message: 'Shift started successfully'
      }
    });
  } catch (err) {
    console.error('Error in startShift:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const endShift = async (req, res) => {
  try {
    const staffId = req.user._id;
    
    const shift = await StaffShift.endActiveShift(staffId);
    
    if (!shift) {
      return res.status(400).json({
        status: 'fail',
        message: 'No active shift found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: shift,
      message: 'Shift ended successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const getActiveShift = async (req, res) => {
  try {
    const staffId = req.user._id;
    
    const activeShift = await StaffShift.getActiveShift(staffId);
    
    if (!activeShift) {
      return res.status(404).json({
        status: 'fail',
        message: 'No active shift found'
      });
    }
    
    // Add current duration and earnings for active shifts
    const shiftData = {
      ...activeShift.toObject(),
      currentDuration: activeShift.getCurrentDuration(),
      currentEarnings: activeShift.getCurrentEarnings()
    };
    
    res.status(200).json({
      status: 'success',
      data: shiftData
    });
  } catch (err) {
    console.error('Error in getActiveShift:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const getStaffShiftHistory = async (req, res) => {
  try {
    const staffId = req.user._id;
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    // Build filter
    const filter = { staff: staffId };
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }
    
    const shifts = await StaffShift.find(filter)
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('staff', 'firstName lastName email');
    
    const total = await StaffShift.countDocuments(filter);
    
    // Calculate totals
    const totals = await StaffShift.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalHours: { $sum: { $divide: ['$duration', 60] } },
          totalEarnings: { $sum: '$salary.totalEarned' },
          totalShifts: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        shifts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        },
        summary: totals[0] || {
          totalHours: 0,
          totalEarnings: 0,
          totalShifts: 0
        }
      }
    });
  } catch (err) {
    console.error('Error in getStaffShiftHistory:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const updateStaffProfile = async (req, res) => {
  try {
    const staffId = req.user._id;
    const { firstName, lastName, email, phone } = req.body;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: staffId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          status: 'fail',
          message: 'Email is already taken by another user'
        });
      }
    }

    // Update staff profile
    const updatedStaff = await User.findByIdAndUpdate(
      staffId,
      {
        firstName,
        lastName,
        email,
        phone
      },
      { 
        new: true, 
        runValidators: true,
        select: '-password'
      }
    );

    if (!updatedStaff) {
      return res.status(404).json({
        status: 'fail',
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: updatedStaff
    });
  } catch (err) {
    console.error('Error updating staff profile:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const changeStaffPassword = async (req, res) => {
  try {
    const staffId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get staff with password
    const staff = await User.findById(staffId).select('+password');
    
    if (!staff) {
      return res.status(404).json({
        status: 'fail',
        message: 'Staff member not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, staff.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'fail',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(staffId, {
      password: hashedNewPassword
    });

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Error changing staff password:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};
