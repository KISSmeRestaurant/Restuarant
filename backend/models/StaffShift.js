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
  }
});

// Calculate duration before saving
staffShiftSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = (this.endTime - this.startTime) / (1000 * 60); // Convert ms to minutes
  }
  next();
});

export default mongoose.model('StaffShift', staffShiftSchema);