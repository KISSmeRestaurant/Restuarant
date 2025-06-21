import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../config/constants.js';

export const admin = async (req, res, next) => {
  try {
    // 1) Get token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    // 2) Verify token
    const decoded = await jwt.verify(token, JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does no longer exist.'
      });
    }

    // 4) Check if user is admin
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Your session has expired! Please log in again.'
      });
    }
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token'
    });
  }
};

export const getAdminDetails = async (req, res, next) => {
  try {
    console.log('Req.user in getAdminDetails:', req.user); // Add this line
    
    if (!req.user) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      postcode: req.user.postcode,
      createdAt: req.user.createdAt
    });
  } catch (err) {
    console.error('Error in getAdminDetails:', err);
    next(err);
  }
};