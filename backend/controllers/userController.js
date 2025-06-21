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