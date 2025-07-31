import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../../config/api.js';
import { 
  FaSpinner, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle, 
  FaShoppingBag, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaClock,
  FaSearch,
  FaFilter,
  FaStar,
  FaHeart,
  FaReceipt,
  FaTruck,
  FaUtensils
} from 'react-icons/fa';
import { 
  MdRestaurantMenu, 
  MdDeliveryDining, 
  MdRateReview,
  MdLocationOn,
  MdPhone as MdPhoneIcon,
  MdAccessTime,
  MdTrendingUp
} from 'react-icons/md';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError(null);
        const response = await apiRequest('/orders/my-orders');
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      setError(null);
      await apiRequest(`/orders/${orderId}/cancel`, {
        method: 'PUT'
      });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'cancelled' } : order
      ));
    } catch (err) {
      setError(err.message || 'Failed to cancel order');
      console.error('Error cancelling order:', err);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'current') return ['pending', 'preparing', 'ready'].includes(order.status);
    return order.status === activeTab;
  });

  const getStatusDetails = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: <FaClock className="mr-1" /> };
      case 'preparing':
        return { color: 'bg-blue-100 text-blue-800', icon: <FaSpinner className="mr-1 animate-spin" /> };
      case 'ready':
        return { color: 'bg-green-100 text-green-800', icon: <FaCheckCircle className="mr-1" /> };
      case 'delivered':
        return { color: 'bg-purple-100 text-purple-800', icon: <FaShoppingBag className="mr-1" /> };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: <FaTimesCircle className="mr-1" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <FaInfoCircle className="mr-1" /> };
    }
  };

  if (loading) return (
    <div className="p-6">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8"
    >
      {/* Header Section */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage your delicious orders</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center text-amber-600">
                <FaUtensils className="mr-2" />
                <span className="font-medium">{orders.length} Total Orders</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Tabs */}
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-2 mb-8"
      >
        <div className="flex overflow-x-auto space-x-1">
          {[
            { key: 'all', label: 'All Orders', icon: <FaReceipt className="mr-2" /> },
            { key: 'current', label: 'Active', icon: <FaClock className="mr-2" /> },
            { key: 'delivered', label: 'Delivered', icon: <FaTruck className="mr-2" /> },
            { key: 'cancelled', label: 'Cancelled', icon: <FaTimesCircle className="mr-2" /> }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.key 
                  ? 'bg-amber-100 text-amber-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Orders Content */}
      <AnimatePresence mode="wait">
        {filteredOrders.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <FaShoppingBag className="text-3xl text-gray-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {activeTab === 'all' 
                ? "You haven't placed any orders yet. Start exploring our delicious menu!" 
                : `You don't have any ${activeTab} orders at the moment.`}
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/menu" 
                className="inline-flex items-center bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-md"
              >
                <MdRestaurantMenu className="mr-2" />
                Browse Menu
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="orders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-900 mr-3">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </h3>
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusDetails(order.status).color}`}
                        >
                          {getStatusDetails(order.status).icon}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </motion.span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MdAccessTime className="mr-1" />
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{order.items.length} items</div>
                    </div>
                  </div>

                  {/* Order Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Items Section */}
                    <div className="lg:col-span-1">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FaUtensils className="mr-2 text-amber-500" />
                        Order Items
                      </h4>
                      <div className="space-y-3">
                        {order.items.map(item => (
                          <motion.div 
                            key={item.food._id}
                            whileHover={{ x: 4 }}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <span className="font-medium text-gray-900">{item.food.name}</span>
                              <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                            </div>
                            <span className="font-semibold text-amber-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="lg:col-span-1">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <MdDeliveryDining className="mr-2 text-amber-500" />
                        Delivery Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                          <MdLocationOn className="mr-3 text-amber-500 mt-1 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-gray-900">Address</div>
                            <div className="text-sm text-gray-600">{order.deliveryInfo.address}</div>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <MdPhoneIcon className="mr-3 text-amber-500" />
                          <div>
                            <div className="font-medium text-gray-900">Contact</div>
                            <div className="text-sm text-gray-600">{order.deliveryInfo.phone}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FaReceipt className="mr-2 text-amber-500" />
                        Order Summary
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">${(order.totalAmount * 0.9).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax (10%)</span>
                          <span className="font-medium">${(order.totalAmount * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span className="text-amber-600">${order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                    {['pending', 'preparing'].includes(order.status) && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => cancelOrder(order._id)}
                        className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-all font-medium"
                      >
                        Cancel Order
                      </motion.button>
                    )}
                    {order.status === 'delivered' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-all font-medium flex items-center"
                      >
                        <MdRateReview className="mr-2" />
                        Rate Order
                      </motion.button>
                    )}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={`/my-orders/${order._id}`}
                        className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium shadow-sm"
                      >
                        View Details
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserOrders;