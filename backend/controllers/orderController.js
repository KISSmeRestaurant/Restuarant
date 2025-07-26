// controllers/orderController.js
import Order from '../models/Order.js';
import Food from '../models/Food.js';

export const createOrder = async (req, res) => {
  try {
    const { items, deliveryInfo, paymentMethod } = req.body;
    const userId = req.user.id;

    // Calculate order items and subtotal
    let subtotal = 0;
    const orderItems = await Promise.all(items.map(async item => {
      const food = await Food.findById(item.food);
      if (!food) {
        throw new Error(`Food item with ID ${item.food} not found`);
      }
      subtotal += food.price * item.quantity;
      return {
        food: food._id,
        quantity: item.quantity,
        price: food.price
      };
    }));

    // Calculate pricing breakdown
    const vatRate = 20; // 20% VAT
    const netAmount = subtotal / (1 + vatRate / 100);
    const vatAmount = subtotal - netAmount;
    const deliveryFee = deliveryInfo && deliveryInfo.deliveryOption === 'delivery' ? 5 : 0;
    const serviceCharge = 0; // No service charge for now
    const totalAmount = subtotal + deliveryFee + serviceCharge;

    const pricing = {
      subtotal: subtotal,
      netAmount: netAmount,
      vatAmount: vatAmount,
      vatRate: vatRate,
      serviceCharge: serviceCharge,
      deliveryFee: deliveryFee,
      totalAmount: totalAmount,
      currency: 'USD',
      currencySymbol: '$'
    };

    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount: totalAmount, // Legacy field
      pricing: pricing,
      deliveryInfo: {
        name: deliveryInfo && deliveryInfo.name ? deliveryInfo.name : '',
        phone: deliveryInfo && deliveryInfo.phone ? deliveryInfo.phone : '',
        address: deliveryInfo && deliveryInfo.address ? deliveryInfo.address : '',
        city: deliveryInfo && deliveryInfo.city ? deliveryInfo.city : '',
        notes: deliveryInfo && deliveryInfo.notes ? deliveryInfo.notes : '',
        deliveryType: deliveryInfo && deliveryInfo.deliveryOption ? deliveryInfo.deliveryOption : 'delivery'
      },
      paymentInfo: {
        method: paymentMethod || 'cash',
        status: 'pending'
      }
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.food', 'name price');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.food', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id,
      user: req.user.id 
    }).populate('items.food', 'name price image');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only allow cancellation if order is pending or preparing
    if (!['pending', 'preparing'].includes(order.status)) {
      return res.status(400).json({ 
        message: `Order cannot be cancelled as it is already ${order.status}`
      });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
