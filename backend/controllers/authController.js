import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import validator from 'validator';
import User from '../models/User.js';
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_COOKIE_EXPIRES } from '../config/constants.js';
import nodemailer from 'nodemailer';


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

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email
export const sendOTP = async (req, res) => {
  console.log('🔥 sendOTP controller called');
  console.log('Request body:', req.body);
  
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that email'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to user
    user.otp = otp;
    user.otpExpires = otpExpires;
    user.isOtpVerified = false;
    await user.save({ validateBeforeSave: false });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Your Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}\nThis OTP is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d97706;">Password Reset Request</h2>
          <p>Hello ${user.firstName},</p>
          <p>We received a request to reset your password. Please use the following OTP:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #d97706; margin: 0; font-size: 32px;">${otp}</h1>
          </div>
          <p>This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Restaurant Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

   res.status(200).json({
      status: 'success',
      message: 'OTP sent to email'
    });

  } catch (err) {
    console.error('Error in sendOTP:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and OTP'
      });
    }

    const user = await User.findOne({ 
      email,
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid OTP or OTP expired'
      });
    }

    // Mark OTP as verified
    user.isOtpVerified = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'OTP verified successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error verifying OTP'
    });
  }
};

// Reset Password (after OTP verification)
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, password, passwordConfirm } = req.body;
    
    if (!email || !password || !passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email, password and password confirmation'
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Passwords do not match'
      });
    }

    // Find user with verified OTP and bypass validation
    const user = await User.findOne({ 
      email,
      isOtpVerified: true
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'OTP not verified or user not found'
      });
    }

    // Update password fields
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordChangedAt = Date.now() - 1000;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isOtpVerified = undefined;

    // Save without validation since terms were already accepted at signup
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully'
    });

  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Error resetting password'
    });
  }
};