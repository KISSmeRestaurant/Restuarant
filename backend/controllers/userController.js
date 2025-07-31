// controllers/userController.js
import User from '../models/User.js';

// controllers/userController.js
export const getCurrentUser = async (req, res, next) => {
  try {
    // User is already attached to req by auth middleware
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      postcode: user.postcode,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (err) {
    next(err);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, postcode } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        status: 'fail',
        message: 'First name and last name are required'
      });
    }

    // Validate phone number format if provided
    if (phone && !/^\+?[\d\s\-\(\)]{10,15}$/.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid phone number'
      });
    }

    // Validate postcode format if provided (basic UK postcode validation)
    if (postcode && !/^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(postcode)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid UK postcode'
      });
    }

    // Check if phone number is already taken by another user
    if (phone) {
      const existingUser = await User.findOne({ 
        phone: phone,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({
          status: 'fail',
          message: 'Phone number is already registered to another account'
        });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone ? phone.trim() : undefined,
        postcode: postcode ? postcode.trim().toUpperCase() : undefined
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    // Return updated user data (excluding sensitive fields)
    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        postcode: updatedUser.postcode,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      }
    });

  } catch (err) {
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors
      });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        status: 'fail',
        message: `${field} is already registered to another account`
      });
    }

    next(err);
  }
};
