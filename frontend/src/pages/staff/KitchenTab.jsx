import { FaClock, FaCheckCircle, FaUtensils, FaHistory } from 'react-icons/fa';
import { MdKitchen, MdDeliveryDining } from 'react-icons/md';
import { motion } from 'framer-motion';

const KitchenTab = ({ orders, updateOrderStatus }) => {
  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Time formatter
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <MdKitchen className="mr-2 text-amber-600" /> Kitchen Dashboard
        </h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Order Stats Summary */}
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ delay: 0.1 }}
            className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 shadow-sm"
          >
            <div className="flex items-center">
              <FaClock className="text-yellow-600 text-xl mr-2" />
              <span className="text-sm font-medium text-yellow-800">Pending</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900 mt-2">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm"
          >
            <div className="flex items-center">
              <FaUtensils className="text-blue-600 text-xl mr-2" />
              <span className="text-sm font-medium text-blue-800">Preparing</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-2">
              {orders.filter(o => o.status === 'preparing').length}
            </div>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ delay: 0.3 }}
            className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm"
          >
            <div className="flex items-center">
              <FaCheckCircle className="text-green-600 text-xl mr-2" />
              <span className="text-sm font-medium text-green-800">Ready</span>
            </div>
            <div className="text-2xl font-bold text-green-900 mt-2">
              {orders.filter(o => o.status === 'ready').length}
            </div>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ delay: 0.4 }}
            className="bg-purple-50 p-4 rounded-lg border border-purple-100 shadow-sm"
          >
            <div className="flex items-center">
              <MdDeliveryDining className="text-purple-600 text-xl mr-2" />
              <span className="text-sm font-medium text-purple-800">Delivered</span>
            </div>
            <div className="text-2xl font-bold text-purple-900 mt-2">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
          </motion.div>
        </div>

        {/* Pending Orders */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          className="border rounded-xl shadow-sm overflow-hidden"
        >
          <div className="bg-yellow-100 px-4 py-3 border-b flex items-center">
            <FaClock className="text-yellow-700 mr-2" />
            <h4 className="font-semibold text-yellow-800">Pending Orders</h4>
            <span className="ml-auto bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              {orders.filter(o => o.status === 'pending').length}
            </span>
          </div>
          <div className="p-4">
            {orders.filter(o => o.status === 'pending').length > 0 ? (
              orders.filter(o => o.status === 'pending').map((order, index) => (
                <motion.div 
                  key={order._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 * index }}
                  className="mb-4 p-4 border rounded-lg bg-white shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</div>
                    <div className="text-xs text-gray-500">{formatTime(order.createdAt)}</div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                        <span>{item.food?.name || 'Custom Item'}</span>
                        <span className="font-medium">× {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {order.note && (
                    <div className="text-xs bg-amber-50 text-amber-800 p-2 rounded mb-3">
                      <span className="font-medium">Note:</span> {order.note}
                    </div>
                  )}
                  <button
                    onClick={() => updateOrderStatus(order._id, 'preparing')}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center"
                  >
                    <MdKitchen className="mr-2" /> Start Preparing
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-6">
                <FaHistory className="mx-auto text-2xl mb-2" />
                <p>No pending orders</p>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Preparing Orders */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          transition={{ delay: 0.2 }}
          className="border rounded-xl shadow-sm overflow-hidden"
        >
          <div className="bg-blue-100 px-4 py-3 border-b flex items-center">
            <FaUtensils className="text-blue-700 mr-2" />
            <h4 className="font-semibold text-blue-800">In Progress</h4>
            <span className="ml-auto bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {orders.filter(o => o.status === 'preparing').length}
            </span>
          </div>
          <div className="p-4">
            {orders.filter(o => o.status === 'preparing').length > 0 ? (
              orders.filter(o => o.status === 'preparing').map((order, index) => (
                <motion.div 
                  key={order._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 * index }}
                  className="mb-4 p-4 border rounded-lg bg-white shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</div>
                    <div className="text-xs text-gray-500">{formatTime(order.updatedAt)}</div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                        <span>{item.food?.name || 'Custom Item'}</span>
                        <span className="font-medium">× {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updateOrderStatus(order._id, 'ready')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center"
                  >
                    <FaCheckCircle className="mr-2" /> Mark as Ready
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-6">
                <MdKitchen className="mx-auto text-2xl mb-2" />
                <p>No orders in progress</p>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Ready Orders */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          transition={{ delay: 0.3 }}
          className="border rounded-xl shadow-sm overflow-hidden"
        >
          <div className="bg-green-100 px-4 py-3 border-b flex items-center">
            <FaCheckCircle className="text-green-700 mr-2" />
            <h4 className="font-semibold text-green-800">Ready for Pickup</h4>
            <span className="ml-auto bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              {orders.filter(o => o.status === 'ready').length}
            </span>
          </div>
          <div className="p-4">
            {orders.filter(o => o.status === 'ready').length > 0 ? (
              orders.filter(o => o.status === 'ready').map((order, index) => (
                <motion.div 
                  key={order._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 * index }}
                  className="mb-4 p-4 border rounded-lg bg-white shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</div>
                    <div className="text-xs text-gray-500">{formatTime(order.updatedAt)}</div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                        <span>{item.food?.name || 'Custom Item'}</span>
                        <span className="font-medium">× {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center"
                  >
                    <MdDeliveryDining className="mr-2" /> Mark as Delivered
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-6">
                <FaCheckCircle className="mx-auto text-2xl mb-2" />
                <p>No orders ready</p>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Recently Delivered */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          transition={{ delay: 0.4 }}
          className="border rounded-xl shadow-sm overflow-hidden"
        >
          <div className="bg-purple-100 px-4 py-3 border-b flex items-center">
            <MdDeliveryDining className="text-purple-700 mr-2" />
            <h4 className="font-semibold text-purple-800">Recently Delivered</h4>
            <span className="ml-auto bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
              {orders.filter(o => o.status === 'delivered').length}
            </span>
          </div>
          <div className="p-4">
            {orders.filter(o => o.status === 'delivered').slice(0, 3).length > 0 ? (
              orders.filter(o => o.status === 'delivered').slice(0, 3).map((order, index) => (
                <motion.div 
                  key={order._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 * index }}
                  className="mb-4 p-4 border rounded-lg bg-white shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</div>
                    <div className="text-xs text-gray-500">{formatTime(order.updatedAt)}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.items.slice(0, 2).map((item, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                        <span>{item.food?.name || 'Custom Item'}</span>
                        <span className="font-medium">× {item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-xs text-gray-400 mt-1">
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-6">
                <MdDeliveryDining className="mx-auto text-2xl mb-2" />
                <p>No recent deliveries</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KitchenTab;