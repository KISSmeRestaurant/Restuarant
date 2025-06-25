// controllers/staffController.js
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import Feedback from '../models/Feedback.js';
import StaffShift from '../models/StaffShift.js';

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
    const activeShift = await StaffShift.findOne({
      staff: staffId,
      endTime: null
    });
    
    if (activeShift) {
      // Instead of returning error, return the existing shift
      return res.status(200).json({
        status: 'success',
        data: {
          shift: activeShift,
          startTime: activeShift.startTime
        }
      });
    }
    
    // Create new shift if none exists
    const shift = await StaffShift.create({
      staff: staffId,
      startTime: new Date()
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        shift,
        startTime: shift.startTime
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
    
    const shift = await StaffShift.findOneAndUpdate(
      {
        staff: staffId,
        endTime: null
      },
      {
        endTime: new Date()
      },
      {
        new: true
      }
    );
    
    if (!shift) {
      return res.status(400).json({
        status: 'fail',
        message: 'No active shift found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: shift
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
    
    const activeShift = await StaffShift.findOne({
      staff: staffId,
      endTime: null
    });
    
    if (!activeShift) {
      return res.status(404).json({
        status: 'fail',
        message: 'No active shift found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: activeShift
    });
  } catch (err) {
    console.error('Error in getActiveShift:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};