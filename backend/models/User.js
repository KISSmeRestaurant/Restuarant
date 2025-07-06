import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; 

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords do not match'
    }
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function(v) {
        return /\d{10,15}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'staff'],
    default: 'user'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  termsAccepted: {
    type: Boolean,
    required: [true, 'You must accept the terms and conditions'],
    validate: {
      validator: function(value) {
        return value === true;
      },
      message: 'You must accept the terms and conditions'
    }
  },
  marketingOptIn: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: Date,
  passwordChangedAt: Date,
  
  // Password reset fields
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordResetCode: String,
  passwordResetCodeExpires: Date,
  
  // OTP fields
  otp: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  isOtpVerified: {
    type: Boolean,
    default: false,
    select: false
  },

  active: {
    type: Boolean,
    default: true,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove sensitive fields when converting to JSON
      delete ret.password;
      delete ret.passwordConfirm;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.passwordResetCode;
      delete ret.passwordResetCodeExpires;
      delete ret.otp;
      delete ret.otpExpires;
      delete ret.isOtpVerified;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove sensitive fields when converting to object
      delete ret.password;
      delete ret.passwordConfirm;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.passwordResetCode;
      delete ret.passwordResetCodeExpires;
      delete ret.otp;
      delete ret.otpExpires;
      delete ret.isOtpVerified;
      return ret;
    }
  }
});

// Add instance method to compare passwords
UserSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Add instance method to check if password was changed after token was issued
UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Add instance method to create password reset token
UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Add instance method to create OTP
UserSchema.methods.createOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.otp = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.isOtpVerified = false;
  return otp;
};

// Add instance method to verify OTP
UserSchema.methods.verifyOTP = function(enteredOTP) {
  return (
    this.otp === enteredOTP &&
    this.otpExpires > Date.now()
  );
};

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Set passwordChangedAt when password is modified
UserSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Filter out inactive users
UserSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

export default mongoose.model('User', UserSchema);