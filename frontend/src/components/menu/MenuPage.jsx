import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import SearchBar from '../common/SearchBar';
import MenuItem from './MenuItem';
import LoginModal from './LoginModal';
import FloatingCartButton from './FloatingCartButton';

const MenuPage = ({ 
  activeCategory, 
  categories, 
  filteredItems, 
  foodItems,
  cartItemCount,
  foodTypeFilter,
  onCategoryChange, 
  onFoodTypeFilterChange,
  onAddToCart,
  onViewCart,
  showLoginModal,
  setShowLoginModal,
  navigate,
  loading,
  error
}) => {
  const [searchResults, setSearchResults] = useState(null);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const displayItems = searchResults || filteredItems;

  // Close mobile categories when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMobileCategories && !e.target.closest('.mobile-categories')) {
        setShowMobileCategories(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileCategories]);

  return (
    <div className="bg-gradient-to-b from-amber-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm"
          >
            <p>{error}</p>
          </motion.div>
        )}

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 font-serif">
            Our <span className="text-amber-600">Delicious</span> Menu
          </h1>
          <div className="w-24 h-1.5 bg-amber-400 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover culinary excellence with our carefully crafted dishes made from the finest ingredients
          </p>
        </motion.div>

        {/* Search Bar and Food Type Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full">
              <SearchBar 
                allItems={foodItems} 
                onSearchResults={setSearchResults}
              />
            </div>
            
            {/* Food Type Filters */}
            <div className="flex gap-2 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onFoodTypeFilterChange('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  foodTypeFilter === 'all'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                }`}
              >
                All
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onFoodTypeFilterChange('veg')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  foodTypeFilter === 'veg'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                Veg
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onFoodTypeFilterChange('non-veg')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  foodTypeFilter === 'non-veg'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                Non-Veg
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Mobile Category Toggle */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setShowMobileCategories(!showMobileCategories)}
            className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium flex items-center justify-center"
          >
            {showMobileCategories ? 'Hide Categories' : 'Browse Categories'}
          </button>
        </div>

        {/* Mobile Categories Panel */}
        {showMobileCategories && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mobile-categories md:hidden fixed inset-0 z-50 bg-white p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
              <button 
                onClick={() => setShowMobileCategories(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onCategoryChange('all');
                  setShowMobileCategories(false);
                }}
                className={`p-4 rounded-xl shadow-md flex flex-col items-center ${
                  activeCategory === 'all' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-white text-gray-800'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-2">
                  <span className="text-amber-600 font-bold">ALL</span>
                </div>
                <span className="font-medium">All Menu</span>
              </motion.div>
              
              {categories.map(category => (
                <motion.div 
                  key={category._id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onCategoryChange(category._id);
                    setShowMobileCategories(false);
                  }}
                  className={`p-4 rounded-xl shadow-md flex flex-col items-center ${
                    activeCategory === category._id 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-white text-gray-800'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden mb-2">
                    {category.imageUrl ? (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                        <span className="text-gray-600 text-xs text-center px-1">
                          {category.name.split(' ')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-center capitalize">
                    {category.name.length > 12 ? `${category.name.substring(0, 10)}...` : category.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Circular Category Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-16 hidden md:block"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Categories</h2>
          
          <div className="flex items-center justify-center flex-wrap gap-4 py-4">
            {/* All Categories button */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange('all')}
              className={`flex flex-col items-center cursor-pointer transition-all ${
                activeCategory === 'all' ? 'scale-110' : ''
              }`}
            >
              <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full shadow-lg mb-2 flex items-center justify-center ${
                activeCategory === 'all' 
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 ring-4 ring-amber-300' 
                  : 'bg-gradient-to-br from-amber-100 to-amber-200'
              }`}>
                <span className="text-white font-medium text-sm md:text-base">ALL</span>
              </div>
              <span className="text-sm font-medium text-gray-700">All Menu</span>
            </motion.div>

            {/* Category buttons */}
            {categories.map(category => (
              <motion.div 
                key={category._id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCategoryChange(category._id)}
                className={`flex flex-col items-center cursor-pointer transition-all ${
                  activeCategory === category._id ? 'scale-110' : ''
                }`}
              >
                <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full shadow-lg mb-2 overflow-hidden ${
                  activeCategory === category._id 
                    ? 'ring-4 ring-amber-300' 
                    : ''
                }`}>
                  {category.imageUrl ? (
                    <img 
                      src={category.imageUrl} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                      <span className="text-gray-600 text-xs md:text-sm text-center px-1">
                        {category.name.split(' ')[0]}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {category.name.length > 12 ? `${category.name.substring(0, 10)}...` : category.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Menu Items Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            {activeCategory === 'all' ? 'All Menu Items' : 
             categories.find(c => c._id === activeCategory)?.name || 'Menu Items'}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"
              ></motion.div>
            </div>
          ) : displayItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {displayItems.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MenuItem 
                      item={item}
                      index={index}
                      onAddToCart={onAddToCart}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-xl shadow-sm"
            >
              <div className="text-7xl mb-6">🍽️</div>
              <h3 className="text-2xl font-medium text-gray-700 mb-2">No items found</h3>
              <p className="text-gray-500">
                {searchResults ? 
                  "Try a different search term" : 
                  "Try selecting a different category"}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Floating Cart Button */}
        {cartItemCount > 0 && (
          <FloatingCartButton 
            cartItemCount={cartItemCount}
            onViewCart={onViewCart}
          />
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <LoginModal 
            setShowLoginModal={setShowLoginModal}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
};

export default MenuPage;