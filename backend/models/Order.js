// models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    vatType: {
      type: String,
      enum: ['standard', 'reduced', 'zero'],
      default: 'standard'
    }
  }],
  
  // Pricing breakdown
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    netAmount: {
      type: Number,
      required: true
    },
    vatAmount: {
      type: Number,
      default: 0
    },
    vatRate: {
      type: Number,
      default: 20
    },
    serviceCharge: {
      type: Number,
      default: 0
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'GBP'
    },
    currencySymbol: {
      type: String,
      default: '£'
    }
  },

  // Legacy field for backward compatibility
  totalAmount: {
    type: Number,
    required: true
  },

  deliveryInfo: {
    name: String,
    phone: String,
    address: String,
    city: String,
    postcode: String,
    notes: String,
    deliveryType: {
      type: String,
      enum: ['delivery', 'pickup', 'dine-in'],
      default: 'delivery'
    }
  },

  // Table assignment for dine-in orders
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    default: null
  },

  // Order type
  orderType: {
    type: String,
    enum: ['delivery', 'pickup', 'dine-in'],
    default: 'delivery'
  },

  paymentInfo: {
    method: {
      type: String,
      enum: ['card', 'cash', 'paypal', 'apple_pay', 'google_pay'],
      default: 'card'
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },

  // Order timing
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  preparationTime: {
    type: Number, // in minutes
    default: 30
  },

  // Additional order details
  specialInstructions: String,
  orderNumber: {
    type: String,
    unique: true
  },

  // Tax compliance for UK
  taxDetails: {
    vatNumber: String,
    invoiceRequired: {
      type: Boolean,
      default: false
    },
    businessOrder: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Generate unique order number before saving
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD-${dateStr}-${randomNum}`;
  }
  next();
});

// Virtual for formatted order number
OrderSchema.virtual('formattedOrderNumber').get(function() {
  return this.orderNumber || `ORD-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Method to calculate order totals using settings
OrderSchema.methods.calculateTotals = async function(settings) {
  const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate VAT
  const vatCalculation = settings.calculateVAT(subtotal);
  
  // Calculate service charge
  const serviceCharge = settings.calculateServiceCharge(vatCalculation.netAmount);
  
  // Calculate delivery fee
  const deliveryFee = this.deliveryInfo.deliveryType === 'delivery' ? 
    settings.calculateDeliveryFee(subtotal) : 0;
  
  // Update pricing
  this.pricing = {
    subtotal: subtotal,
    netAmount: vatCalculation.netAmount,
    vatAmount: vatCalculation.vatAmount,
    vatRate: vatCalculation.vatRate,
    serviceCharge: serviceCharge,
    deliveryFee: deliveryFee,
    totalAmount: vatCalculation.grossAmount + serviceCharge + deliveryFee,
    currency: settings.paymentSettings.currency,
    currencySymbol: settings.paymentSettings.currencySymbol
  };
  
  // Update legacy total amount field
  this.totalAmount = this.pricing.totalAmount;
  
  return this.pricing;
};

// Static method to get orders with pricing breakdown
OrderSchema.statics.findWithPricing = function(filter = {}) {
  return this.find(filter)
    .populate('user', 'firstName lastName email phone')
    .populate('items.food', 'name price category')
    .sort({ createdAt: -1 });
};

export default mongoose.model('Order', OrderSchema);
