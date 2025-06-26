import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaSpinner, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaChevronLeft,
  FaUtensils
} from 'react-icons/fa';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingUpdates, setTrackingUpdates] = useState([]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://restuarant-sh57.onrender.com/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setOrder(response.data);
        
        // Simulate tracking updates (in a real app, this would come from the backend)
        const updates = [
          { status: 'pending', timestamp: response.data.createdAt, message: 'Order received' },
          { status: 'preparing', timestamp: new Date(Date.now() - 3600000), message: 'Preparing your food' },
          { status: 'ready', timestamp: new Date(Date.now() - 1800000), message: 'Order ready for delivery' },
          { status: 'delivered', timestamp: new Date(), message: 'Order delivered' }
        ].filter(update => {
          const statusOrder = ['pending', 'preparing', 'ready', 'delivered'];
          return statusOrder.indexOf(update.status) <= statusOrder.indexOf(response.data.status);
        });
        
        setTrackingUpdates(updates);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const cancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      setError(null);
      const token = localStorage.getItem('token');
      await axios.put(`https://restuarant-sh57.onrender.com/api/orders/${id}/cancel`, 
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setOrder({ ...order, status: 'cancelled' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
      console.error('Error cancelling order:', err);
    }
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: <FaClock className="mr-1" /> };
      case 'preparing':
        return { color: 'bg-blue-100 text-blue-800', icon: <FaUtensils className="mr-1" /> };
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

  if (!order) return (
    <div className="p-6">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
        <p>Order not found</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8">
      <Link 
        to="/orders" 
        className="flex items-center text-amber-600 hover:text-amber-700 mb-6"
      >
        <FaChevronLeft className="mr-1" /> Back to My Orders
      </Link>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-0">
              Order #{order._id.slice(-6).toUpperCase()}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm flex items-center ${getStatusDetails(order.status).color}`}>
              {getStatusDetails(order.status).icon}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <p className="text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-4">Order Tracking</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {trackingUpdates.map((update, index) => (
                <div key={index} className="relative pl-10">
                  <div className={`absolute left-4 top-1 h-4 w-4 rounded-full -ml-2 ${
                    index === trackingUpdates.length - 1 
                      ? 'bg-amber-500 ring-4 ring-amber-200' 
                      : 'bg-gray-300'
                  }`}></div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{update.message}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(update.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {index === trackingUpdates.length - 1 && (
                        <span className={`px-2 py-1 rounded text-xs ${getStatusDetails(update.status).color}`}>
                          Current Status
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <ul className="space-y-4">
              {order.items.map(item => (
                <li key={item.food._id} className="flex items-start">
                  <div className="bg-gray-100 rounded-lg p-2 mr-4">
                    <FaUtensils className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.food.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-amber-500 mr-3" />
                <div>
                  <p className="font-medium">Delivery Address</p>
                  <p className="text-gray-600">{order.deliveryInfo.address}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-amber-500 mr-3" />
                <div>
                  <p className="font-medium">Contact Number</p>
                  <p className="text-gray-600">{order.deliveryInfo.phone}</p>
                </div>
              </div>
              {order.deliveryInfo.notes && (
                <div className="flex items-start">
                  <FaInfoCircle className="text-amber-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Delivery Notes</p>
                    <p className="text-gray-600">{order.deliveryInfo.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Order Summary</h4>
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
        </div>

        <div className="p-6 bg-gray-50 flex justify-end">
          {['pending', 'preparing'].includes(order.status) && (
            <button
              onClick={cancelOrder}
              className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition mr-4"
            >
              Cancel Order
            </button>
          )}
          <Link
            to="/menu"
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Order Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;