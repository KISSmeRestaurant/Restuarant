import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

const ConfirmationPage = ({ orderDetails, onBackToMenu }) => {
  if (!orderDetails) return <div>Loading order details...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
        <div className="mb-8">
          <FiCheckCircle className="mx-auto text-6xl text-green-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600">Thank you for your order. We've sent a confirmation to your email.</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-700 mb-4">Order Details</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Order ID:</span> #{orderDetails._id.slice(-6).toUpperCase()}</p>
            <p><span className="font-medium">Status:</span> {orderDetails.status || 'Processing'}</p>
            <p><span className="font-medium">Estimated Delivery:</span> 30-45 minutes</p>
            <p><span className="font-medium">Delivery Address:</span> {orderDetails.deliveryInfo.address}, {orderDetails.deliveryInfo.city}</p>
            <p><span className="font-medium">Contact:</span> {orderDetails.deliveryInfo.name} ({orderDetails.deliveryInfo.phone})</p>
            <p><span className="font-medium">Total Amount:</span> ${orderDetails.totalAmount?.toFixed(2) || '0.00'}</p>
            {orderDetails.deliveryInfo.notes && (
              <p><span className="font-medium">Notes:</span> {orderDetails.deliveryInfo.notes}</p>
            )}
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
    </div>
  );
};

export default ConfirmationPage;