import User from '../models/User.js';

export const getAdminDetails = async (req, res, next) => {
  try {
    // The admin middleware already attaches the user to req.user
    const admin = req.user;
    
    if (!admin) {
      return res.status(404).json({ 
        status: 'fail',
        message: 'Admin not found' 
      });
    }

    // Return minimal necessary admin details
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

// controllers/adminController.js
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users // Changed from { users } to just users
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
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