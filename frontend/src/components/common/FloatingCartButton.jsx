import { motion } from 'framer-motion';
import { FiShoppingCart } from 'react-icons/fi';

const FloatingCartButton = ({ itemCount, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 bg-amber-600 text-white p-4 rounded-full shadow-xl z-50 cursor-pointer floating-cart-button"
      onClick={onClick}
    >
      <div className="relative">
        <FiShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <motion.span
            key={itemCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {itemCount}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

export default FloatingCartButton;