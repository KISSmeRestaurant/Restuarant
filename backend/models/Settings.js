import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  // Restaurant Information
  restaurantInfo: {
    name: {
      type: String,
      required: true,
      default: 'KissMe Restaurant'
    },
    email: {
      type: String,
      required: true,
      default: 'contact@kissme.com'
    },
    phone: {
      type: String,
      required: true,
      default: '+44 20 7946 0958'
    },
    address: {
      street: {
        type: String,
        default: '123 Food Street'
      },
      city: {
        type: String,
        default: 'London'
      },
      postcode: {
        type: String,
        default: 'SW1A 1AA'
      },
      country: {
        type: String,
        default: 'United Kingdom'
      }
    },
    description: {
      type: String,
      default: 'A modern restaurant with a focus on premium food tastes'
    }
  },

  // Business Hours
  businessHours: {
    timezone: {
      type: String,
      default: 'Europe/London'
    },
    schedule: {
      monday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '09:00' },
        closeTime: { type: String, default: '22:00' }
      },
      tuesday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '09:00' },
        closeTime: { type: String, default: '22:00' }
      },
      wednesday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '09:00' },
        closeTime: { type: String, default: '22:00' }
      },
      thursday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '09:00' },
        closeTime: { type: String, default: '22:00' }
      },
      friday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '09:00' },
        closeTime: { type: String, default: '23:00' }
      },
      saturday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '10:00' },
        closeTime: { type: String, default: '23:00' }
      },
      sunday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '10:00' },
        closeTime: { type: String, default: '21:00' }
      }
    }
  },

  // UK Tax Configuration
  taxSettings: {
    country: {
      type: String,
      default: 'UK'
    },
    vatRates: {
      standard: {
        rate: { type: Number, default: 20.0 }, // 20% VAT
        description: { type: String, default: 'Standard VAT rate for most items' }
      },
      reduced: {
        rate: { type: Number, default: 5.0 }, // 5% VAT
        description: { type: String, default: 'Reduced VAT rate for certain food items' }
      },
      zero: {
        rate: { type: Number, default: 0.0 }, // 0% VAT
        description: { type: String, default: 'Zero VAT rate for basic food items' }
      }
    },
    defaultVatRate: {
      type: String,
      enum: ['standard', 'reduced', 'zero'],
      default: 'standard'
    },
    vatNumber: {
      type: String,
      default: ''
    },
    includeVatInPrices: {
      type: Boolean,
      default: true
    }
  },

  // Payment & Fee Settings
  paymentSettings: {
    currency: {
      type: String,
      default: 'GBP'
    },
    currencySymbol: {
      type: String,
      default: '£'
    },
    deliveryFee: {
      type: Number,
      default: 3.99
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 25.00
    },
    minimumOrderAmount: {
      type: Number,
      default: 15.00
    },
    serviceCharge: {
      enabled: { type: Boolean, default: false },
      rate: { type: Number, default: 12.5 }, // 12.5% service charge
      description: { type: String, default: 'Optional service charge' }
    },
    acceptedPaymentMethods: [{
      type: String,
      enum: ['card', 'cash', 'paypal', 'apple_pay', 'google_pay'],
      default: ['card', 'cash']
    }],
    cardProcessingFee: {
      enabled: { type: Boolean, default: false },
      rate: { type: Number, default: 2.9 }
    }
  },

  // Notification Settings
  notificationSettings: {
    email: {
      enabled: { type: Boolean, default: true },
      orderConfirmation: { type: Boolean, default: true },
      orderStatusUpdates: { type: Boolean, default: true },
      dailyReports: { type: Boolean, default: true }
    },
    sms: {
      enabled: { type: Boolean, default: false },
      orderConfirmation: { type: Boolean, default: false },
      orderStatusUpdates: { type: Boolean, default: false }
    },
    push: {
      enabled: { type: Boolean, default: true },
      orderNotifications: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false }
    }
  },

  // System Settings
  systemSettings: {
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    allowOnlineOrders: {
      type: Boolean,
      default: true
    },
    allowReservations: {
      type: Boolean,
      default: true
    },
    maxOrdersPerHour: {
      type: Number,
      default: 50
    },
    orderPreparationTime: {
      type: Number,
      default: 30 // minutes
    }
  },

  // Legal & Compliance
  legalSettings: {
    termsAndConditions: {
      type: String,
      default: ''
    },
    privacyPolicy: {
      type: String,
      default: ''
    },
    cookiePolicy: {
      type: String,
      default: ''
    },
    allergenInformation: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
SettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Method to calculate tax for an amount
SettingsSchema.methods.calculateVAT = function(amount, vatType = null) {
  const vatRate = vatType ? 
    this.taxSettings.vatRates[vatType]?.rate || this.taxSettings.vatRates[this.taxSettings.defaultVatRate].rate :
    this.taxSettings.vatRates[this.taxSettings.defaultVatRate].rate;
  
  if (this.taxSettings.includeVatInPrices) {
    // VAT is included in the price, calculate the VAT portion
    const vatAmount = (amount * vatRate) / (100 + vatRate);
    return {
      netAmount: amount - vatAmount,
      vatAmount: vatAmount,
      grossAmount: amount,
      vatRate: vatRate
    };
  } else {
    // VAT is added to the price
    const vatAmount = (amount * vatRate) / 100;
    return {
      netAmount: amount,
      vatAmount: vatAmount,
      grossAmount: amount + vatAmount,
      vatRate: vatRate
    };
  }
};

// Method to calculate service charge
SettingsSchema.methods.calculateServiceCharge = function(amount) {
  if (!this.paymentSettings.serviceCharge.enabled) {
    return 0;
  }
  return (amount * this.paymentSettings.serviceCharge.rate) / 100;
};

// Method to calculate delivery fee
SettingsSchema.methods.calculateDeliveryFee = function(orderAmount) {
  if (orderAmount >= this.paymentSettings.freeDeliveryThreshold) {
    return 0;
  }
  return this.paymentSettings.deliveryFee;
};

export default mongoose.model('Settings', SettingsSchema);
