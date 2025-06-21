import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
  onCategoryChange, 
  onAddToCart,
  onViewCart,
  showLoginModal,
  setShowLoginModal,
  navigate,
  loading,
  error
}) => {
  const [searchResults, setSearchResults] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const menuItemsRef = useRef(null);
  const displayItems = searchResults || filteredItems;

  const scrollLeft = () => {
    if (menuItemsRef.current) {
      menuItemsRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (menuItemsRef.current) {
      menuItemsRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

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

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 max-w-2xl mx-auto"
        >
          <SearchBar 
            allItems={foodItems} 
            onSearchResults={setSearchResults}
          />
        </motion.div>

        {/* Circular Category Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Categories</h2>
          
          <div className="flex items-center justify-center space-x-2 md:space-x-4 lg:space-x-6 overflow-x-auto py-4 px-2 hide-scrollbar">
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
          className="relative"
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
            <div className="relative">
              <button 
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-amber-50 transition-colors"
                aria-label="Scroll left"
              >
                <FiChevronLeft className="text-amber-600 w-6 h-6" />
              </button>
              
              <div 
                ref={menuItemsRef}
                className="flex space-x-6 overflow-x-auto py-4 px-2 hide-scrollbar"
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onMouseMove={(e) => {
                  if (isDragging && menuItemsRef.current) {
                    menuItemsRef.current.scrollLeft -= e.movementX;
                  }
                }}
              >
                <AnimatePresence>
                  {displayItems.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex-shrink-0 w-64"
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

              <button 
                onClick={scrollRight}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-amber-50 transition-colors"
                aria-label="Scroll right"
              >
                <FiChevronRight className="text-amber-600 w-6 h-6" />
              </button>
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

      {/* Footer Wave */}
      <div className="w-full overflow-hidden">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full">
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            className="fill-amber-200"
          ></path>
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            className="fill-amber-200"
          ></path>
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            className="fill-amber-300"
          ></path>
        </svg>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MenuPage;