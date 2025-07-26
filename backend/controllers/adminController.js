import User from '../models/User.js';
import StaffShift from '../models/StaffShift.js';
import Settings from '../models/Settings.js';
import Order from '../models/Order.js';
import Table from '../models/Table.js';

export const getAdminDetails = async (req, res, next) => {
  try {
    const admin = req.user;
    
    if (!admin) {
      return res.status(404).json({ 
        status: 'fail',
        message: 'Admin not found' 
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
        postcode: admin.postcode,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin || new Date()
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid role specified'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// Table Management Functions
export const getAllTables = async (req, res, next) => {
  try {
    const tables = await Table.find({ isActive: true })
      .populate('currentOrder')
      .sort({ tableNumber: 1 });

    res.status(200).json({
      status: 'success',
      data: tables
    });
  } catch (err) {
    next(err);
  }
};

export const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, location, position, description } = req.body;

    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({
        status: 'fail',
        message: 'Table number already exists'
      });
    }

    const table = await Table.create({
      tableNumber,
      capacity,
      location,
      position,
      description
    });

    res.status(201).json({
      status: 'success',
      data: table
    });
  } catch (err) {
    next(err);
  }
};

export const updateTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, location, position, description, status } = req.body;

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({
        status: 'fail',
        message: 'Table not found'
      });
    }

    // Check if table number is being changed and if it already exists
    if (tableNumber && tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({ tableNumber });
      if (existingTable) {
        return res.status(400).json({
          status: 'fail',
          message: 'Table number already exists'
        });
      }
    }

    const updatedTable = await Table.findByIdAndUpdate(
      req.params.id,
      {
        tableNumber,
        capacity,
        location,
        position,
        description,
        status
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: updatedTable
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({
        status: 'fail',
        message: 'Table not found'
      });
    }

    // Check if table has active orders
    if (table.currentOrder) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot delete table with active orders'
      });
    }

    // Soft delete by setting isActive to false
    await Table.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({
      status: 'success',
      message: 'Table deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Staff Shift Management Functions
export const getAllStaffShifts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, staffId, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (staffId) filter.staff = staffId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    const shifts = await StaffShift.find(filter)
      .populate('staff', 'firstName lastName email phone')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StaffShift.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: shifts.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: shifts
    });
  } catch (err) {
    next(err);
  }
};

export const getStaffShiftById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const shift = await StaffShift.findById(id)
      .populate('staff', 'firstName lastName email phone');

    if (!shift) {
      return res.status(404).json({
        status: 'fail',
        message: 'Staff shift not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: shift
    });
  } catch (err) {
    next(err);
  }
};

export const updateStaffShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate status if provided
    if (updates.status && !['active', 'completed'].includes(updates.status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid status. Must be either "active" or "completed"'
      });
    }

    const shift = await StaffShift.findByIdAndUpdate(id, updates, { 
      new: true, 
      runValidators: true 
    }).populate('staff', 'firstName lastName email phone');

    if (!shift) {
      return res.status(404).json({
        status: 'fail',
        message: 'Staff shift not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: shift
    });
  } catch (err) {
    next(err);
  }
};

export const deleteStaffShift = async (req, res, next) => {
  try {
    const { id } = req.params;

    const shift = await StaffShift.findByIdAndDelete(id);

    if (!shift) {
      return res.status(404).json({
        status: 'fail',
        message: 'Staff shift not found'
      });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const getStaffShiftStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no date range provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await StaffShift.aggregate([
      {
        $match: {
          startTime: { $gte: start, $lte: end }
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
          totalShifts: { $sum: 1 },
          totalHours: { $sum: { $divide: ['$duration', 60] } },
          activeShifts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedShifts: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { totalHours: -1 }
      }
    ]);

    // Overall statistics
    const overallStats = await StaffShift.aggregate([
      {
        $match: {
          startTime: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalShifts: { $sum: 1 },
          totalHours: { $sum: { $divide: ['$duration', 60] } },
          activeShifts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedShifts: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageDuration: { $avg: '$duration' }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        dateRange: { start, end },
        overall: overallStats[0] || {
          totalShifts: 0,
          totalHours: 0,
          activeShifts: 0,
          completedShifts: 0,
          averageDuration: 0
        },
        byStaff: stats
      }
    });
  } catch (err) {
    next(err);
  }
};

// Settings Management Functions
export const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    
    res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;
    
    // Get current settings or create new one
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Update settings with provided data
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
          // Handle nested objects
          settings[key] = { ...settings[key], ...updates[key] };
        } else {
          settings[key] = updates[key];
        }
      }
    });

    await settings.save();

    res.status(200).json({
      status: 'success',
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

export const updateRestaurantInfo = async (req, res, next) => {
  try {
    const { name, email, phone, address, description } = req.body;
    
    const settings = await Settings.getSettings();
    
    if (name) settings.restaurantInfo.name = name;
    if (email) settings.restaurantInfo.email = email;
    if (phone) settings.restaurantInfo.phone = phone;
    if (address) settings.restaurantInfo.address = { ...settings.restaurantInfo.address, ...address };
    if (description) settings.restaurantInfo.description = description;
    
    await settings.save();

    res.status(200).json({
      status: 'success',
      message: 'Restaurant information updated successfully',
      data: settings.restaurantInfo
    });
  } catch (err) {
    next(err);
  }
};

export const updateBusinessHours = async (req, res, next) => {
  try {
    const { schedule, timezone } = req.body;
    
    const settings = await Settings.getSettings();
    
    if (schedule) {
      Object.keys(schedule).forEach(day => {
        if (settings.businessHours.schedule[day]) {
          settings.businessHours.schedule[day] = { 
            ...settings.businessHours.schedule[day], 
            ...schedule[day] 
          };
        }
      });
    }
    
    if (timezone) settings.businessHours.timezone = timezone;
    
    await settings.save();

    res.status(200).json({
      status: 'success',
      message: 'Business hours updated successfully',
      data: settings.businessHours
    });
  } catch (err) {
    next(err);
  }
};

export const updateTaxSettings = async (req, res, next) => {
  try {
    const { vatRates, defaultVatRate, vatNumber, includeVatInPrices } = req.body;
    
    const settings = await Settings.getSettings();
    
    if (vatRates) {
      settings.taxSettings.vatRates = { ...settings.taxSettings.vatRates, ...vatRates };
    }
    if (defaultVatRate) settings.taxSettings.defaultVatRate = defaultVatRate;
    if (vatNumber !== undefined) settings.taxSettings.vatNumber = vatNumber;
    if (includeVatInPrices !== undefined) settings.taxSettings.includeVatInPrices = includeVatInPrices;
    
    await settings.save();

    res.status(200).json({
      status: 'success',
      message: 'Tax settings updated successfully',
      data: settings.taxSettings
    });
  } catch (err) {
    next(err);
  }
};

export const updatePaymentSettings = async (req, res, next) => {
  try {
    const { 
      currency, 
      currencySymbol, 
      deliveryFee, 
      freeDeliveryThreshold, 
      minimumOrderAmount, 
      serviceCharge, 
      acceptedPaymentMethods,
      cardProcessingFee 
    } = req.body;
    
    const settings = await Settings.getSettings();
    
    if (currency) settings.paymentSettings.currency = currency;
    if (currencySymbol) settings.paymentSettings.currencySymbol = currencySymbol;
    if (deliveryFee !== undefined) settings.paymentSettings.deliveryFee = deliveryFee;
    if (freeDeliveryThreshold !== undefined) settings.paymentSettings.freeDeliveryThreshold = freeDeliveryThreshold;
    if (minimumOrderAmount !== undefined) settings.paymentSettings.minimumOrderAmount = minimumOrderAmount;
    if (serviceCharge) settings.paymentSettings.serviceCharge = { ...settings.paymentSettings.serviceCharge, ...serviceCharge };
    if (acceptedPaymentMethods) settings.paymentSettings.acceptedPaymentMethods = acceptedPaymentMethods;
    if (cardProcessingFee) settings.paymentSettings.cardProcessingFee = { ...settings.paymentSettings.cardProcessingFee, ...cardProcessingFee };
    
    await settings.save();

    res.status(200).json({
      status: 'success',
      message: 'Payment settings updated successfully',
      data: settings.paymentSettings
    });
  } catch (err) {
    next(err);
  }
};

export const calculateOrderTotals = async (req, res, next) => {
  try {
    const { subtotal, deliveryRequired = false, vatType = null } = req.body;
    
    if (!subtotal || subtotal <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Valid subtotal is required'
      });
    }

    const settings = await Settings.getSettings();
    
    // Calculate VAT
    const vatCalculation = settings.calculateVAT(subtotal, vatType);
    
    // Calculate service charge (applied to net amount)
    const serviceCharge = settings.calculateServiceCharge(vatCalculation.netAmount);
    
    // Calculate delivery fee
    const deliveryFee = deliveryRequired ? settings.calculateDeliveryFee(subtotal) : 0;
    
    // Calculate final total
    const finalTotal = vatCalculation.grossAmount + serviceCharge + deliveryFee;
    
    res.status(200).json({
      status: 'success',
      data: {
        subtotal: subtotal,
        netAmount: vatCalculation.netAmount,
        vatAmount: vatCalculation.vatAmount,
        vatRate: vatCalculation.vatRate,
        serviceCharge: serviceCharge,
        deliveryFee: deliveryFee,
        total: finalTotal,
        currency: settings.paymentSettings.currency,
        currencySymbol: settings.paymentSettings.currencySymbol,
        breakdown: {
          includesVat: settings.taxSettings.includeVatInPrices,
          serviceChargeRate: settings.paymentSettings.serviceCharge.rate,
          serviceChargeEnabled: settings.paymentSettings.serviceCharge.enabled
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const resetSettings = async (req, res, next) => {
  try {
    // Delete existing settings and create new default ones
    await Settings.deleteMany({});
    const settings = await Settings.create({});

    res.status(200).json({
      status: 'success',
      message: 'Settings reset to default values',
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

// Order Statistics Functions
export const getOrderStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no date range provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Basic order statistics
    const basicStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { 
            $sum: { 
              $cond: [
                { $ifNull: ['$pricing.totalAmount', false] },
                '$pricing.totalAmount',
                '$totalAmount'
              ]
            }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          deliveredRevenue: {
            $sum: { 
              $cond: [
                { $eq: ['$status', 'delivered'] },
                { 
                  $cond: [
                    { $ifNull: ['$pricing.totalAmount', false] },
                    '$pricing.totalAmount',
                    '$totalAmount'
                  ]
                },
                0
              ]
            }
          },
          pendingOrders: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery']] }, 1, 0] }
          },
          pendingRevenue: {
            $sum: { 
              $cond: [
                { $in: ['$status', ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery']] },
                { 
                  $cond: [
                    { $ifNull: ['$pricing.totalAmount', false] },
                    '$pricing.totalAmount',
                    '$totalAmount'
                  ]
                },
                0
              ]
            }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          cancelledRevenue: {
            $sum: { 
              $cond: [
                { $eq: ['$status', 'cancelled'] },
                { 
                  $cond: [
                    { $ifNull: ['$pricing.totalAmount', false] },
                    '$pricing.totalAmount',
                    '$totalAmount'
                  ]
                },
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = basicStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      deliveredOrders: 0,
      deliveredRevenue: 0,
      pendingOrders: 0,
      pendingRevenue: 0,
      cancelledOrders: 0,
      cancelledRevenue: 0
    };

    // Calculate additional metrics
    const averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
    const deliveryRate = stats.totalOrders > 0 ? (stats.deliveredOrders / stats.totalOrders) * 100 : 0;
    const cancellationRate = stats.totalOrders > 0 ? (stats.cancelledOrders / stats.totalOrders) * 100 : 0;

    res.status(200).json({
      status: 'success',
      data: {
        dateRange: { start, end },
        summary: {
          totalOrders: stats.totalOrders,
          totalRevenue: Math.round(stats.totalRevenue * 100) / 100,
          deliveredRevenue: Math.round(stats.deliveredRevenue * 100) / 100,
          pendingRevenue: Math.round(stats.pendingRevenue * 100) / 100,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          deliveryRate: Math.round(deliveryRate * 100) / 100,
          cancellationRate: Math.round(cancellationRate * 100) / 100
        },
        breakdown: {
          delivered: {
            count: stats.deliveredOrders,
            revenue: Math.round(stats.deliveredRevenue * 100) / 100
          },
          pending: {
            count: stats.pendingOrders,
            revenue: Math.round(stats.pendingRevenue * 100) / 100
          },
          cancelled: {
            count: stats.cancelledOrders,
            revenue: Math.round(stats.cancelledRevenue * 100) / 100
          }
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    // Default to last 30 days if no date range provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Group by format based on groupBy parameter
    let dateGroupFormat;
    switch (groupBy) {
      case 'hour':
        dateGroupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'week':
        dateGroupFormat = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        dateGroupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default: // day
        dateGroupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    // Revenue over time
    const revenueOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: dateGroupFormat,
          totalRevenue: { 
            $sum: { 
              $cond: [
                { $ifNull: ['$pricing.totalAmount', false] },
                '$pricing.totalAmount',
                '$totalAmount'
              ]
            }
          },
          deliveredRevenue: {
            $sum: { 
              $cond: [
                { $eq: ['$status', 'delivered'] },
                { 
                  $cond: [
                    { $ifNull: ['$pricing.totalAmount', false] },
                    '$pricing.totalAmount',
                    '$totalAmount'
                  ]
                },
                0
              ]
            }
          },
          orderCount: { $sum: 1 },
          deliveredCount: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Revenue by payment method
    const revenueByPayment = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: '$paymentInfo.method',
          revenue: { 
            $sum: { 
              $cond: [
                { $ifNull: ['$pricing.totalAmount', false] },
                '$pricing.totalAmount',
                '$totalAmount'
              ]
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    // Revenue by order status
    const revenueByStatus = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          revenue: { 
            $sum: { 
              $cond: [
                { $ifNull: ['$pricing.totalAmount', false] },
                '$pricing.totalAmount',
                '$totalAmount'
              ]
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        dateRange: { start, end },
        revenueOverTime: revenueOverTime.map(item => ({
          ...item,
          totalRevenue: Math.round(item.totalRevenue * 100) / 100,
          deliveredRevenue: Math.round(item.deliveredRevenue * 100) / 100
        })),
        revenueByPayment: revenueByPayment.map(item => ({
          ...item,
          revenue: Math.round(item.revenue * 100) / 100
        })),
        revenueByStatus: revenueByStatus.map(item => ({
          ...item,
          revenue: Math.round(item.revenue * 100) / 100
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};
