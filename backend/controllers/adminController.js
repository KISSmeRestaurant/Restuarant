import User from '../models/User.js';
import StaffShift from '../models/StaffShift.js';

export const getAdminDetails = async (req, res, next) => {
  try {
    const admin = req.user;
    
    if (!admin) {
      return res.status(404).json({ 
        status: 'fail',
        message: 'Admin not found' 
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
        postcode: admin.postcode,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin || new Date()
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid role specified'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// Staff Shift Management Functions
export const getAllStaffShifts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, staffId, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (staffId) filter.staff = staffId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    const shifts = await StaffShift.find(filter)
      .populate('staff', 'firstName lastName email phone')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StaffShift.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: shifts.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: shifts
    });
  } catch (err) {
    next(err);
  }
};

export const getStaffShiftById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const shift = await StaffShift.findById(id)
      .populate('staff', 'firstName lastName email phone');

    if (!shift) {
      return res.status(404).json({
        status: 'fail',
        message: 'Staff shift not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: shift
    });
  } catch (err) {
    next(err);
  }
};

export const updateStaffShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate status if provided
    if (updates.status && !['active', 'completed'].includes(updates.status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid status. Must be either "active" or "completed"'
      });
    }

    const shift = await StaffShift.findByIdAndUpdate(id, updates, { 
      new: true, 
      runValidators: true 
    }).populate('staff', 'firstName lastName email phone');

    if (!shift) {
      return res.status(404).json({
        status: 'fail',
        message: 'Staff shift not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: shift
    });
  } catch (err) {
    next(err);
  }
};

export const deleteStaffShift = async (req, res, next) => {
  try {
    const { id } = req.params;

    const shift = await StaffShift.findByIdAndDelete(id);

    if (!shift) {
      return res.status(404).json({
        status: 'fail',
        message: 'Staff shift not found'
      });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const getStaffShiftStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no date range provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await StaffShift.aggregate([
      {
        $match: {
          startTime: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'staff',
          foreignField: '_id',
          as: 'staffInfo'
        }
      },
      {
        $unwind: '$staffInfo'
      },
      {
        $group: {
          _id: '$staff',
          staffName: { $first: { $concat: ['$staffInfo.firstName', ' ', '$staffInfo.lastName'] } },
          totalShifts: { $sum: 1 },
          totalHours: { $sum: { $divide: ['$duration', 60] } },
          activeShifts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedShifts: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { totalHours: -1 }
      }
    ]);

    // Overall statistics
    const overallStats = await StaffShift.aggregate([
      {
        $match: {
          startTime: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalShifts: { $sum: 1 },
          totalHours: { $sum: { $divide: ['$duration', 60] } },
          activeShifts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedShifts: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageDuration: { $avg: '$duration' }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        dateRange: { start, end },
        overall: overallStats[0] || {
          totalShifts: 0,
          totalHours: 0,
          activeShifts: 0,
          completedShifts: 0,
          averageDuration: 0
        },
        byStaff: stats
      }
    });
  } catch (err) {
    next(err);
  }
};
