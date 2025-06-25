import User from '../models/User.js';

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