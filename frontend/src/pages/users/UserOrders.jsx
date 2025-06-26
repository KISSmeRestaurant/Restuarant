import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaShoppingBag, FaMapMarkerAlt, FaPhone, FaClock } from 'react-icons/fa';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        const response = await axios.get('https://restuarant-sh57.onrender.com/api/orders/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setOrders(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
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
      const token = localStorage.getItem('token');
      await axios.put(`https://restuarant-sh57.onrender.com/api/orders/${orderId}/cancel`, 
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'cancelled' } : order
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
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
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-amber-900">My Orders</h1>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-500'}`}
        >
          All Orders
        </button>
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 font-medium ${activeTab === 'current' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-500'}`}
        >
          Current Orders
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`px-4 py-2 font-medium ${activeTab === 'delivered' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-500'}`}
        >
          Delivered
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 font-medium ${activeTab === 'cancelled' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-500'}`}
        >
          Cancelled
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FaShoppingBag className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No orders found</h3>
          <p className="text-gray-500 mt-2">
            {activeTab === 'all' 
              ? "You haven't placed any orders yet." 
              : `You don't have any ${activeTab} orders.`}
          </p>
          <Link 
            to="/menu" 
            className="mt-4 inline-block bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => (
            <div key={order._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-white p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div className="mb-3 md:mb-0">
                    <h3 className="text-lg font-semibold">Order #{order._id.slice(-6).toUpperCase()}</h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm flex items-center ${getStatusDetails(order.status).color}`}>
                      {getStatusDetails(order.status).icon}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Items</h4>
                    <ul className="space-y-2">
                      {order.items.map(item => (
                        <li key={item.food._id} className="flex justify-between">
                          <span className="text-gray-600">
                            {item.quantity} × {item.food.name}
                          </span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Delivery Info</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="mr-2 text-amber-500" />
                        {order.deliveryInfo.address}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaPhone className="mr-2 text-amber-500" />
                        {order.deliveryInfo.phone}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Order Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>${(order.totalAmount * 0.9).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (10%)</span>
                        <span>${(order.totalAmount * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                        <span>Total</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  {['pending', 'preparing'].includes(order.status) && (
                    <button
                      onClick={() => cancelOrder(order._id)}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition"
                    >
                      Cancel Order
                    </button>
                  )}
                  <Link
                    to={`/orders/${order._id}`}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;