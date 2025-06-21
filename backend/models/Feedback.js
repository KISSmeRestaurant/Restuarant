import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required']
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    match: [/.+\@.+\..+/, 'Please enter a valid email']
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    maxlength: [500, 'Feedback cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  staffResponse: {
    type: String,
    maxlength: [500, 'Response cannot exceed 500 characters']
  },
  respondedAt: {
    type: Date
  }
});

export default mongoose.model('Feedback', feedbackSchema);