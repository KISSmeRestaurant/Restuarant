import Table from '../models/Table.js';
import Order from '../models/Order.js';
import AppError from '../utils/appError.js';

// Get all tables
export const getAllTables = async (req, res, next) => {
  try {
    console.log('Fetching tables for user:', req.user?.role, req.user?._id);
    
    const tables = await Table.find({ isActive: true })
      .populate('currentOrder')
      .sort({ tableNumber: 1 });

    console.log(`Found ${tables.length} active tables`);

    res.status(200).json({
      success: true,
      data: tables,
      count: tables.length
    });
  } catch (error) {
    console.error('Error in getAllTables:', error);
    next(new AppError(`Failed to fetch tables: ${error.message}`, 500));
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
    console.log('Assigning order to table:', req.params.id, 'orderId:', orderId);
    
    const table = await Table.findById(req.params.id);

    if (!table) {
      console.error('Table not found:', req.params.id);
      return next(new AppError('Table not found', 404));
    }

    if (!table.isAvailable()) {
      console.error('Table is not available:', table.status);
      return next(new AppError('Table is not available', 400));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return next(new AppError('Order not found', 404));
    }

    // Update table
    await table.occupyWithOrder(orderId);
    console.log('Table updated successfully:', table._id);

    // Update order
    order.table = table._id;
    order.orderType = 'dine-in';
    if (order.deliveryInfo) {
      order.deliveryInfo.deliveryType = 'dine-in';
    }
    await order.save();
    console.log('Order updated successfully:', order._id);

    // Populate the updated table with order details
    const updatedTable = await Table.findById(table._id).populate('currentOrder');

    res.status(200).json({
      success: true,
      data: updatedTable,
      message: 'Order assigned to table successfully'
    });
  } catch (error) {
    console.error('Error in assignOrderToTable:', error);
    next(new AppError(`Failed to assign order to table: ${error.message}`, 500));
  }
};

// Add items to existing table order
export const addItemsToTableOrder = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of items to add
    console.log('Adding items to table order:', req.params.id, 'items:', items);
    
    const table = await Table.findById(req.params.id).populate('currentOrder');

    if (!table) {
      console.error('Table not found:', req.params.id);
      return next(new AppError('Table not found', 404));
    }

    if (!table.currentOrder) {
      console.error('No active order for table:', req.params.id);
      return next(new AppError('No active order found for this table', 400));
    }

    const order = await Order.findById(table.currentOrder._id);
    if (!order) {
      console.error('Order not found:', table.currentOrder._id);
      return next(new AppError('Order not found', 404));
    }

    // Add new items to existing order
    const newItems = items.map(item => ({
      food: item.food,
      quantity: item.quantity,
      price: item.price,
      vatType: item.vatType || 'standard'
    }));

    // Check if items already exist in order and update quantity, or add new items
    newItems.forEach(newItem => {
      const existingItemIndex = order.items.findIndex(
        item => item.food.toString() === newItem.food.toString()
      );

      if (existingItemIndex !== -1) {
        // Update existing item quantity
        order.items[existingItemIndex].quantity += newItem.quantity;
      } else {
        // Add new item
        order.items.push(newItem);
      }
    });

    // Recalculate totals
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update pricing (simplified calculation)
    order.pricing = {
      subtotal: subtotal,
      netAmount: subtotal,
      vatAmount: subtotal * 0.2, // 20% VAT
      vatRate: 20,
      serviceCharge: 0,
      deliveryFee: 0,
      totalAmount: subtotal * 1.2, // Including VAT
      currency: 'GBP',
      currencySymbol: '£'
    };
    
    order.totalAmount = order.pricing.totalAmount;

    await order.save();
    console.log('Order updated successfully with new items:', order._id);

    // Return updated order
    const updatedOrder = await Order.findById(order._id).populate('items.food');

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Items added to order successfully'
    });
  } catch (error) {
    console.error('Error in addItemsToTableOrder:', error);
    next(new AppError(`Failed to add items to order: ${error.message}`, 500));
  }
};

// Get table bill for printing
export const getTableBill = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id)
      .populate({
        path: 'currentOrder',
        populate: {
          path: 'items.food',
          select: 'name price description category'
        }
      });

    if (!table) {
      return next(new AppError('Table not found', 404));
    }

    if (!table.currentOrder) {
      return next(new AppError('No active order found for this table', 400));
    }

    const order = table.currentOrder;
    
    // Calculate bill details
    const billData = {
      table: {
        number: table.tableNumber,
        capacity: table.capacity,
        location: table.location
      },
      order: {
        id: order._id,
        orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
        date: order.createdAt,
        customer: {
          name: order.deliveryInfo?.name || 'Walk-in Customer',
          phone: order.deliveryInfo?.phone || '',
          notes: order.deliveryInfo?.notes || ''
        },
        items: order.items.map(item => ({
          name: item.food.name,
          description: item.food.description,
          category: item.food.category,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        pricing: {
          subtotal: order.pricing?.subtotal || order.totalAmount,
          vatAmount: order.pricing?.vatAmount || (order.totalAmount * 0.2),
          vatRate: order.pricing?.vatRate || 20,
          serviceCharge: order.pricing?.serviceCharge || 0,
          totalAmount: order.totalAmount,
          currency: order.pricing?.currency || 'GBP',
          currencySymbol: order.pricing?.currencySymbol || '£'
        }
      },
      restaurant: {
        name: 'Restaurant Name', // You can make this configurable
        address: 'Restaurant Address',
        phone: 'Restaurant Phone',
        email: 'restaurant@email.com'
      },
      printedAt: new Date(),
      printedBy: req.user?.firstName + ' ' + req.user?.lastName || 'Staff'
    };

    res.status(200).json({
      success: true,
      data: billData
    });
  } catch (error) {
    console.error('Error in getTableBill:', error);
    next(new AppError(`Failed to generate bill: ${error.message}`, 500));
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
