import Table from '../models/Table.js';
import Order from '../models/Order.js';
import AppError from '../utils/appError.js';

// Get all tables
export const getAllTables = async (req, res, next) => {
  try {
    const tables = await Table.find({ isActive: true })
      .populate('currentOrder')
      .sort({ tableNumber: 1 });

    res.status(200).json({
      success: true,
      data: tables
    });
  } catch (error) {
    next(new AppError('Failed to fetch tables', 500));
  }
};

// Get table by ID
export const getTableById = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id)
      .populate('currentOrder');

    if (!table) {
      return next(new AppError('Table not found', 404));
    }

    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    next(new AppError('Failed to fetch table', 500));
  }
};

// Create new table (Admin only)
export const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, location, position, description } = req.body;

    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return next(new AppError('Table number already exists', 400));
    }

    const table = await Table.create({
      tableNumber,
      capacity,
      location,
      position,
      description
    });

    res.status(201).json({
      success: true,
      data: table
    });
  } catch (error) {
    next(new AppError('Failed to create table', 500));
  }
};

// Update table (Admin only)
export const updateTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, location, position, description, status } = req.body;

    const table = await Table.findById(req.params.id);
    if (!table) {
      return next(new AppError('Table not found', 404));
    }

    // Check if table number is being changed and if it already exists
    if (tableNumber && tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({ tableNumber });
      if (existingTable) {
        return next(new AppError('Table number already exists', 400));
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
      success: true,
      data: updatedTable
    });
  } catch (error) {
    next(new AppError('Failed to update table', 500));
  }
};

// Delete table (Admin only)
export const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return next(new AppError('Table not found', 404));
    }

    // Check if table has active orders
    if (table.currentOrder) {
      return next(new AppError('Cannot delete table with active orders', 400));
    }

    // Soft delete by setting isActive to false
    await Table.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error) {
    next(new AppError('Failed to delete table', 500));
  }
};

// Get available tables
export const getAvailableTables = async (req, res, next) => {
  try {
    const tables = await Table.getAvailableTables();

    res.status(200).json({
      success: true,
      data: tables
    });
  } catch (error) {
    next(new AppError('Failed to fetch available tables', 500));
  }
};

// Get occupied tables with orders
export const getOccupiedTables = async (req, res, next) => {
  try {
    const tables = await Table.getOccupiedTablesWithOrders();

    res.status(200).json({
      success: true,
      data: tables
    });
  } catch (error) {
    next(new AppError('Failed to fetch occupied tables', 500));
  }
};

// Update table status
export const updateTableStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const table = await Table.findById(req.params.id);

    if (!table) {
      return next(new AppError('Table not found', 404));
    }

    // If setting to available, clear current order
    if (status === 'available') {
      table.currentOrder = null;
    }

    table.status = status;
    await table.save();

    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    next(new AppError('Failed to update table status', 500));
  }
};

// Assign order to table
export const assignOrderToTable = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const table = await Table.findById(req.params.id);

    if (!table) {
      return next(new AppError('Table not found', 404));
    }

    if (!table.isAvailable()) {
      return next(new AppError('Table is not available', 400));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Update table
    await table.occupyWithOrder(orderId);

    // Update order
    order.table = table._id;
    order.orderType = 'dine-in';
    order.deliveryInfo.deliveryType = 'dine-in';
    await order.save();

    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    next(new AppError('Failed to assign order to table', 500));
  }
};

// Free table (when order is completed)
export const freeTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return next(new AppError('Table not found', 404));
    }

    await table.freeTable();

    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    next(new AppError('Failed to free table', 500));
  }
};
