import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiMapPin, FiPhone, FiUser, FiHome } from 'react-icons/fi';

const ConfirmationPage = ({ orderDetails, onBackToMenu }) => {
  // Provide default values to prevent undefined errors
  const order = orderDetails || {};
  const items = order.items || [];
  const customerInfo = order.customerInfo || order.deliveryInfo || {};
  const orderId = order.orderId || order._id || 'N/A';
  const estimatedDelivery = order.estimatedDelivery || 'N/A';
  const total = order.total || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your order. We're preparing your delicious meal.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="bg-amber-600 text-white p-6">
              <h2 className="text-xl font-bold">Order Details</h2>
              <p className="text-amber-100">Order ID: #{orderId}</p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-4">
                <FiClock className="text-amber-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Estimated Delivery</p>
                  <p className="text-gray-600">{estimatedDelivery}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Items Ordered</h3>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.food?.name || item.name || 'Unknown Item'}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${(item.price || 0).toFixed(2)} × {item.quantity || 1}
                        </p>
                      </div>
                      <span className="font-medium">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No items found</p>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span className="text-amber-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Delivery Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="bg-gray-800 text-white p-6">
              <h2 className="text-xl font-bold">Delivery Information</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start">
                <FiUser className="text-gray-600 mr-3 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Customer Name</p>
                  <p className="text-gray-600">{customerInfo.name || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FiPhone className="text-gray-600 mr-3 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Phone Number</p>
                  <p className="text-gray-600">{customerInfo.phone || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FiMapPin className="text-gray-600 mr-3 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Delivery Address</p>
                  <p className="text-gray-600">
                    {customerInfo.address || 'N/A'}
                    {customerInfo.city && `, ${customerInfo.city}`}
                  </p>
                </div>
              </div>
              
              {customerInfo.notes && (
                <div className="flex items-start">
                  <FiHome className="text-gray-600 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Delivery Notes</p>
                    <p className="text-gray-600">{customerInfo.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-6 mt-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6">Order Status</h3>
          
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center mb-2">
                <FiCheckCircle />
              </div>
              <span className="text-sm font-medium text-green-600">Confirmed</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center mb-2 animate-pulse">
                <FiClock />
              </div>
              <span className="text-sm font-medium text-amber-600">Preparing</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mb-2">
                <FiMapPin />
              </div>
              <span className="text-sm font-medium text-gray-600">On the way</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mb-2">
                <FiCheckCircle />
              </div>
              <span className="text-sm font-medium text-gray-600">Delivered</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToMenu}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition shadow-md"
          >
            Order More Food
          </motion.button>
          
          <p className="text-gray-500 mt-4">
            Need help? Contact us at <span className="text-amber-600 font-medium">support@restaurant.com</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
