import { motion } from 'framer-motion';
import { FiShoppingCart } from 'react-icons/fi';

const FloatingCartButton = ({ cartItemCount, onViewCart }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 bg-amber-600 text-white p-4 rounded-full shadow-xl z-50 cursor-pointer"
      onClick={onViewCart}
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative">
        <FiShoppingCart className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {cartItemCount}
        </span>
      </div>
    </motion.div>
  );
};

export default FloatingCartButton;