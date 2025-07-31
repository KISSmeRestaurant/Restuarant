import mongoose from 'mongoose';

const staffShiftSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in minutes, can be calculated when shift ends
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  salary: {
    hourlyRate: {
      type: Number,
      default: 0
    },
    totalEarned: {
      type: Number,
      default: 0
    },
    calculatedAt: {
      type: Date
    }
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate duration and salary before saving
staffShiftSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = (this.endTime - this.startTime) / (1000 * 60); // Convert ms to minutes
    
    // Auto-complete shift if endTime is set
    if (this.status === 'active' && this.endTime) {
      this.status = 'completed';
    }
    
    // Calculate salary if hourly rate is set and shift is completed
    if (this.status === 'completed' && this.salary.hourlyRate > 0 && this.duration > 0) {
      const hoursWorked = this.duration / 60;
      this.salary.totalEarned = hoursWorked * this.salary.hourlyRate;
      this.salary.calculatedAt = new Date();
    }
  }
  
  // Ensure active shifts don't have endTime
  if (this.status === 'active') {
    this.endTime = null;
    this.duration = null;
  }
  
  next();
});

// Method to calculate current duration for active shifts
staffShiftSchema.methods.getCurrentDuration = function() {
  if (this.status === 'active' && this.startTime) {
    return (new Date() - this.startTime) / (1000 * 60); // in minutes
  }
  return this.duration || 0;
};

// Method to calculate current earnings for active shifts
staffShiftSchema.methods.getCurrentEarnings = function() {
  const currentDuration = this.getCurrentDuration();
  if (this.salary.hourlyRate > 0 && currentDuration > 0) {
    const hoursWorked = currentDuration / 60;
    return hoursWorked * this.salary.hourlyRate;
  }
  return this.salary.totalEarned || 0;
};

// Method to format duration as hrs:mins:sec
staffShiftSchema.methods.formatDurationHMS = function() {
  const durationMinutes = this.status === 'active' ? this.getCurrentDuration() : (this.duration || 0);
  const totalSeconds = Math.floor(durationMinutes * 60);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Static method to calculate monthly earnings for a staff member
staffShiftSchema.statics.getMonthlyEarnings = function(staffId, year, month) {
  const startDate = new Date(year, month - 1, 1); // month is 0-indexed
  const endDate = new Date(year, month, 0, 23, 59, 59); // last day of month
  
  return this.aggregate([
    {
      $match: {
        staff: staffId,
        status: 'completed',
        startTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$salary.totalEarned' },
        totalHours: { $sum: { $divide: ['$duration', 60] } },
        totalShifts: { $sum: 1 },
        averageHourlyRate: { $avg: '$salary.hourlyRate' }
      }
    }
  ]);
};

// Static method to get all staff monthly earnings
staffShiftSchema.statics.getAllStaffMonthlyEarnings = function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        startTime: { $gte: startDate, $lte: endDate }
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
        staffEmail: { $first: '$staffInfo.email' },
        totalEarnings: { $sum: '$salary.totalEarned' },
        totalHours: { $sum: { $divide: ['$duration', 60] } },
        totalShifts: { $sum: 1 },
        averageHourlyRate: { $avg: '$salary.hourlyRate' }
      }
    },
    {
      $sort: { totalEarnings: -1 }
    }
  ]);
};

// Static method to get active shift for a staff member
staffShiftSchema.statics.getActiveShift = function(staffId) {
  return this.findOne({
    staff: staffId,
    status: 'active',
    endTime: null
  }).populate('staff', 'firstName lastName email');
};

// Static method to end active shift
staffShiftSchema.statics.endActiveShift = function(staffId) {
  return this.findOneAndUpdate(
    {
      staff: staffId,
      status: 'active',
      endTime: null
    },
    {
      endTime: new Date(),
      status: 'completed'
    },
    { new: true }
  ).populate('staff', 'firstName lastName email');
};

export default mongoose.model('StaffShift', staffShiftSchema);
