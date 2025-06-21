import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ allItems, onSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      onSearchResults(null);
      return;
    }

    setIsSearching(true);
    
    // Simple debounce to prevent rapid searches
    const timer = setTimeout(() => {
      const results = allItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(results);
      onSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, allItems, onSearchResults]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    onSearchResults(null);
  };

  return (
    <div className="relative w-full max-w-md mx-auto mb-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search menu items..."
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
        
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FiX className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </motion.div>

      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg">
          <div className="p-4 text-center text-gray-500">Searching...</div>
        </div>
      )}

      {/* Search results dropdown */}
      {searchResults.length > 0 && !isSearching && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg"
        >
          <div className="py-1">
            <p className="px-4 py-2 text-sm text-gray-500 border-b">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </p>
            {searchResults.map(item => (
              <div 
                key={item._id} 
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => {
                  setSearchQuery(item.name);
                  setSearchResults([item]);
                  onSearchResults([item]);
                }}
              >
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-600 truncate">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No results found */}
      {searchResults.length === 0 && searchQuery && !isSearching && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg"
        >
          <div className="p-4 text-center text-gray-500">No items found matching "{searchQuery}"</div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchBar;