import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { FaUser, FaShoppingCart, FaChevronDown } from 'react-icons/fa';
import { MdDashboard, MdPeople, MdRestaurantMenu, MdEventNote } from 'react-icons/md';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData && userData !== 'undefined') {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
        setUser(null);
      }
    };

    // Initial check
    checkAuth();
    
    // Listen for auth changes from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuth();
      }
    };

    // Custom event for auth changes within the same tab
    const handleAuthChange = () => checkAuth();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(cart);
    };

    // Initial load
    updateCartCount();

    // Listen for cart updates
    window.addEventListener('cart-updated', updateCartCount);

    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const handleBookTableClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/book-table' } });
    } else {
      navigate('/book-table');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-amber-900 to-amber-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold flex items-center">
            <span className="mr-2">🍽️</span>
            KissMe
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-amber-200 transition">Home</Link>
            <Link to="/menu" className="hover:text-amber-200 transition">Menu</Link>
            <Link to="/about" className="hover:text-amber-200 transition">About</Link>
            
            {user ? (
              <>
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-1 hover:text-amber-200 transition"
                  >
                    <FaUser className="mr-1" />
                    <span>{user.firstName || 'Profile'}</span>
                    <FaChevronDown className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      {user.role === 'staff' && (
  <Link
    to="/staff/dashboard"
    className="flex items-center px-4 py-2 text-gray-800 hover:bg-amber-100"
    onClick={() => setIsProfileOpen(false)}
  >
    <MdDashboard className="mr-2" />
    Staff Dashboard
  </Link>
)}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard" 
                          className="flex items-center px-4 py-2 text-gray-800 hover:bg-amber-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <MdDashboard className="mr-2" />
                          Admin Dashboard
                        </Link>
                      )}
                      {user.role === 'user' && (
                        <>
                          <Link
                            to="/dashboard"
                            className="flex items-center px-4 py-2 text-gray-800 hover:bg-amber-100"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <MdDashboard className="mr-2" />
                            Dashboard
                          </Link>
                          
                          <Link
                            to="/my-orders"
                            className="flex items-center px-4 py-2 text-gray-800 hover:bg-amber-100"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <MdRestaurantMenu className="mr-2" />
                            My Orders
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-gray-800 hover:bg-amber-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                
             {user?.role === 'user' && (
  <Link to="/cart" className="relative bg-white text-amber-600 p-2 rounded-full hover:bg-amber-100 transition">
    <FaShoppingCart />
    {cartItems.length > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {cartItems.reduce((total, item) => total + item.quantity, 0)}
      </span>
    )}
  </Link>
)}

              </>
            ) : null}

            {/* Book a Table button - shown for non-logged in users and regular users */}
            {(user?.role === 'user' || !user) && (
              <button 
                onClick={handleBookTableClick}
                className="bg-white text-amber-600 px-4 py-2 rounded-full hover:bg-amber-100 transition"
              >
                Book a Table
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <Link 
              to="/" 
              className="block px-3 py-2 hover:bg-teal-700 rounded transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/menu" 
              className="block px-3 py-2 hover:bg-teal-700 rounded transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Menu
            </Link>
            <Link 
              to="/about" 
              className="block px-3 py-2 hover:bg-teal-700 rounded transition"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            {/* Mobile Book a Table button - shown for non-logged in users and regular users */}
            {(user?.role === 'user' || !user) && (
              <button 
                onClick={() => {
                  handleBookTableClick();
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-2 bg-white text-amber-600 rounded-full text-center hover:bg-amber-100 transition"
              >
                Book a Table
              </button>
            )}

            {user && (
  <>
    {user.role === 'admin' ? (
      <Link 
        to="/admin/dashboard" 
        className="block px-3 py-2 hover:bg-teal-700 rounded transition"
        onClick={() => setIsMenuOpen(false)}
      >
        Admin Dashboard
      </Link>
    ) : user.role === 'staff' ? (
      <Link 
        to="/staff/dashboard" 
        className="block px-3 py-2 hover:bg-teal-700 rounded transition"
        onClick={() => setIsMenuOpen(false)}
      >
        <div className="flex items-center">
          <MdDashboard className="mr-2" />
          Staff Dashboard
        </div>
      </Link>
    ) : (
      <>
        <Link 
          to="/dashboard" 
          className="block px-3 py-2 hover:bg-teal-700 rounded transition"
          onClick={() => setIsMenuOpen(false)}
        >
          Dashboard
        </Link>
        <Link 
          to="/my-orders" 
          className="block px-3 py-2 hover:bg-teal-700 rounded transition"
          onClick={() => setIsMenuOpen(false)}
        >
          My Orders
        </Link>
      </>
    )}
    <button 
      onClick={() => {
        handleLogout();
        setIsMenuOpen(false);
      }}
      className="w-full text-left px-3 py-2 hover:bg-teal-700 rounded transition"
    >
      Logout
    </button>
  </>
)}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;