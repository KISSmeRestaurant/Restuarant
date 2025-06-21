// components/menu/MenuItem.js
import { motion } from 'framer-motion';
import { FiShoppingCart } from 'react-icons/fi';

const MenuItem = ({ item, index, onAddToCart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition cursor-pointer h-full flex flex-col"
    >
      <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${
        item.foodType === 'veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {item.foodType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
      </div>
      
      <div className="h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden flex-shrink-0">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-amber-100 to-amber-50 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
          <span className="text-amber-600 font-bold">${item.price.toFixed(2)}</span>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{item.description}</p>
        
        <div className="mb-4">
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full capitalize">
            {item.category}
          </span>
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onAddToCart(item)}
        className="w-full bg-amber-100 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-200 transition font-medium flex items-center justify-center mt-auto"
      >
        <FiShoppingCart className="mr-2" />
        Add to Order
      </motion.button>
    </motion.div>
  );
};

export default MenuItem;