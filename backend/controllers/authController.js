import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import validator from 'validator';
import User from '../models/User.js';
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_COOKIE_EXPIRES } from '../config/constants.js';
import Email from '../utils/email.js';
import SMS from '../utils/sms.js';

// Helper function to create and send token
const createSendToken = (user, statusCode, req, res) => {
  const token = jwt.sign(
    { userId: user._id, role: user.role }, 
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict'
  };

  // Remove password from output
  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// controllers/authController.js
export const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm, phone, termsAccepted, marketingOptIn } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({
        status: 'fail',
        message: 'You must accept the terms and conditions'
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: existingUser.email === email 
          ? 'Email already in use' 
          : 'Phone number already in use'
      });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      phone,
      termsAccepted,
      marketingOptIn
    });

    try {
      const url = `${req.protocol}://${req.get('host')}/verify-email?token=${newUser._id}`;
      await new Email(newUser, url).sendWelcome();
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    // Create token and send response
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role }, 
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove sensitive data
    newUser.password = undefined;
    newUser.passwordConfirm = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({
        status: 'fail',
        message: messages.join('. ')
      });
    }
    console.error('Signup error:', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during signup'
    });
  }
};
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password +loginAttempts +accountLockedUntil');

    if (!user || !(await user.correctPassword(password, user.password))) {
      if (user) {
        user.loginAttempts += 1;
        await user.save({ validateBeforeSave: false });

        if (user.loginAttempts >= 5) {
          user.accountLockedUntil = Date.now() + 30 * 60 * 1000;
          await user.save({ validateBeforeSave: false });

          return res.status(401).json({
            status: 'fail',
            message: 'Account locked. Too many failed attempts. Try again in 30 minutes.'
          });
        }
      }

      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    if (user.accountLockedUntil && user.accountLockedUntil > Date.now()) {
      return res.status(401).json({
        status: 'fail',
        message: `Account locked. Try again in ${Math.ceil((user.accountLockedUntil - Date.now()) / (60 * 1000))} minutes.`
      });
    }

    user.loginAttempts = 0;
    user.accountLockedUntil = null;
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
export const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
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

    // 2) Verification token
    const decoded = await jwt.verify(token, JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does no longer exist.'
      });
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'User recently changed password! Please log in again.'
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide either email or phone number'
      });
    }

    let user;
    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that email or phone number'
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      if (email) {
        // Send email
        const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();
      } else {
        // Send SMS
        const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-digit code
        user.passwordResetCode = resetCode;
        user.passwordResetCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save({ validateBeforeSave: false });

        await new SMS(user).sendPasswordResetCode(resetCode);
      }

      res.status(200).json({
        status: 'success',
        message: 'Reset instructions sent successfully'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordResetCode = undefined;
      user.passwordResetCodeExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the reset instructions. Please try again later.'
      });
    }
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, code, password, passwordConfirm } = req.body;

    if (!token && !code) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide either reset token or verification code'
      });
    }

    let user;
    if (token) {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });
    } else {
      user = await User.findOne({
        passwordResetCode: code,
        passwordResetCodeExpires: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token or code is invalid or has expired'
      });
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    await user.save();

    if (user.email) {
      await new Email(user).sendPasswordResetConfirmation();
    } else {
      await new SMS(user).sendPasswordResetConfirmation();
    }

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully'
    });
  } catch (err) {
    next(err);
  }
};


export const updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your current password is wrong.'
      });
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, req, res);
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.token);
    
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid verification token'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already verified'
      });
    }

    user.emailVerified = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Email successfully verified'
    });
  } catch (err) {
    next(err);
  }
};
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true
  });
  
  res.status(200).json({ 
    status: 'success',
    message: 'Logged out successfully'
  });
};