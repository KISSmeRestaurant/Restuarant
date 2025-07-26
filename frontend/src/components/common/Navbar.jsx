import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { FaUser, FaShoppingCart, FaChevronDown, FaSearch, FaUserCircle, FaCog, FaHistory, FaHeart, FaShoppingBag, FaSignOutAlt } from 'react-icons/fa';
import { MdDashboard, MdRestaurantMenu, MdEventNote, MdSettings, MdAccountCircle, MdFavorite, MdNotifications } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { validateToken } from '../../services/auth';

const Navbar = ({ isHomePage }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Determine if we're on the home page
  const onHomePage = isHomePage !== undefined ? isHomePage : location.pathname === '/';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData && userData !== 'undefined') {
          // Validate token before setting user
          const isValid = await validateToken();
          if (isValid) {
            setUser(JSON.parse(userData));
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

  return (
    <nav className={`${onHomePage ? 'absolute top-0' : 'fixed top-0'} w-full z-50 h-16`}>
      <div className="container mx-auto px-1 h-full pt-2">
        <div className={`flex justify-between items-center h-full rounded-full ${onHomePage ? 'bg-gradient-to-r from-amber-900/95 to-amber-700/95' : 'bg-gradient-to-r from-amber-900 to-amber-700'} text-white shadow-lg px-6 py-3 backdrop-blur-sm`}>
          <Link to="/" className="text-2xl font-bold flex items-center">
            <span className="mr-2">🍽️</span>
            KissMe
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/about" className="hover:text-amber-200 transition">About</Link>
            
            {!user && (
              <Link to="/login" className="hover:text-amber-200 transition">Register</Link>
            )}

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
            
            {user && (
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
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {user.role === 'staff' && (
                        <Link
                          to="/staff/dashboard"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <MdDashboard className="mr-3 text-lg" />
                          <span className="font-medium">Staff Dashboard</span>
                        </Link>
                      )}
                      
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard" 
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <MdDashboard className="mr-3 text-lg" />
                          <span className="font-medium">Admin Dashboard</span>
                        </Link>
                      )}
                      
                      {user.role === 'user' && (
                        <>
                          <Link
                            to="/dashboard"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <MdAccountCircle className="mr-3 text-lg" />
                            <span className="font-medium">My Dashboard</span>
                          </Link>
                          
                          <Link
                            to="/my-orders"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <FaHistory className="mr-3 text-lg" />
                            <span className="font-medium">Order History</span>
                          </Link>

                          <div className="border-t border-gray-100 my-2"></div>

                          <Link
                            to="/notifications"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <MdNotifications className="mr-3 text-lg" />
                            <span className="font-medium">Notifications</span>
                          </Link>
                        </>
                      )}

                      {/* Logout button for all user types */}
                      <div className="border-t border-gray-100 my-2"></div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <FaSignOutAlt className="mr-3 text-lg" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
          <div className="md:hidden mt-2 rounded-lg bg-gradient-to-b from-amber-800/95 to-amber-700/95 text-white shadow-lg px-6 py-4 backdrop-blur-sm">
            <Link 
              to="/about" 
              className="block px-3 py-2 hover:bg-amber-600/50 rounded transition"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            {!user && (
              <Link 
                to="/login" 
                className="block px-3 py-2 hover:bg-amber-600/50 rounded transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            )}

            {user && (
              <>
                <div className="border-t border-amber-600/30 my-2"></div>
                <div className="px-3 py-2 text-amber-200 text-sm font-medium">
                  {user.firstName} {user.lastName} ({user.role})
                </div>
                
                {user.role === 'admin' ? (
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center px-3 py-2 hover:bg-amber-600/50 rounded transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MdDashboard className="mr-2" />
                    Admin Dashboard
                  </Link>
                ) : user.role === 'staff' ? (
                  <Link 
                    to="/staff/dashboard" 
                    className="flex items-center px-3 py-2 hover:bg-amber-600/50 rounded transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MdDashboard className="mr-2" />
                    Staff Dashboard
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="flex items-center px-3 py-2 hover:bg-amber-600/50 rounded transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MdAccountCircle className="mr-2" />
                      My Dashboard
                    </Link>
                    <Link 
                      to="/my-orders" 
                      className="flex items-center px-3 py-2 hover:bg-amber-600/50 rounded transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaHistory className="mr-2" />
                      Order History
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
