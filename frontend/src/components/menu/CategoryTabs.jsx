import { motion } from 'framer-motion';

const CategoryTabs = ({ activeCategory, categories, onCategoryChange }) => {
  return (
    <motion.div 
      className="flex flex-wrap justify-center gap-2 mb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-6 py-3 rounded-full transition font-medium ${activeCategory === 'all' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-amber-300'}`}
        onClick={() => onCategoryChange('all')}
      >
        All Menu
      </motion.button>
      
      {categories.map(category => (
        <motion.button
          key={category._id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-full transition font-medium ${activeCategory === category.name ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-amber-300'}`}
          onClick={() => onCategoryChange(category.name)}
        >
          {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default CategoryTabs;