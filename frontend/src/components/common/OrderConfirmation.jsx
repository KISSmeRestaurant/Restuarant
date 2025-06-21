import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

const OrderConfirmation = ({ orderDetails, onBackToMenu }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex justify-center mb-6"
      >
        <FiCheckCircle className="w-16 h-16 text-green-500" />
      </motion.div>
      
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Confirmed!</h2>
      <p className="text-lg text-gray-600 mb-6">
        Thank you for your order. We've received it and will prepare it right away.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
        <h3 className="font-semibold text-gray-700 mb-4">Order Details</h3>
        
        <div className="space-y-2">
          <p><span className="font-medium">Order ID:</span> #{orderDetails.orderId}</p>
          <p><span className="font-medium">Estimated Delivery:</span> 30-45 minutes</p>
          <p><span className="font-medium">Delivery Address:</span> {orderDetails.address}</p>
          <p><span className="font-medium">Total Amount:</span> ${orderDetails.totalAmount}</p>
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBackToMenu}
        className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition"
      >
        Back to Menu
      </motion.button>
    </div>
  );
};

export default OrderConfirmation;