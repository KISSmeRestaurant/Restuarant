import mongoose from 'mongoose';

const TableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'cleaning'],
    default: 'available'
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'private', 'bar'],
    default: 'indoor'
  },
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    }
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Index for efficient queries
TableSchema.index({ status: 1, isActive: 1 });
TableSchema.index({ tableNumber: 1 });

// Virtual for table display name
TableSchema.virtual('displayName').get(function() {
  return `Table ${this.tableNumber}`;
});

// Method to check if table is available
TableSchema.methods.isAvailable = function() {
  return this.status === 'available' && this.isActive;
};

// Method to occupy table with order
TableSchema.methods.occupyWithOrder = function(orderId) {
  this.status = 'occupied';
  this.currentOrder = orderId;
  return this.save();
};

// Method to free table
TableSchema.methods.freeTable = function() {
  this.status = 'available';
  this.currentOrder = null;
  return this.save();
};

// Static method to get available tables
TableSchema.statics.getAvailableTables = function() {
  return this.find({ 
    status: 'available', 
    isActive: true 
  }).sort({ tableNumber: 1 });
};

// Static method to get occupied tables with orders
TableSchema.statics.getOccupiedTablesWithOrders = function() {
  return this.find({ 
    status: 'occupied', 
    isActive: true 
  })
  .populate('currentOrder')
  .sort({ tableNumber: 1 });
};

export default mongoose.model('Table', TableSchema);
