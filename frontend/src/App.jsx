import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminUsers from './pages/admin/Users';
import Navbar from './components/common/Navbar';
import UserDashboard from './pages/UserDashboard';
import PrivateRoute from './components/core/PrivateRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPasswordForm';
import Terms from './pages/Terms';  
import About from './pages/About';
import BookTable from './pages/BookaTable';
import Menu from './pages/Menu';
import Orders from './pages/admin/Orders';
import StaffDashboard from './pages/staff/StaffDashboard';
import Cart from './components/common/Cart';
import OrderDetail from './pages/users/OrderDetail';  
import UserOrders from './pages/users/UserOrders';  
import { validateToken } from './services/auth';
import './styles/global.css';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }

    // Add navbar spacing class for non-home pages
    if (location.pathname === '/') {
      document.body.classList.remove('navbar-spacing');
      document.body.classList.add('home');
    } else {
      document.body.classList.add('navbar-spacing');
      document.body.classList.remove('home');
    }

    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
        if (!publicPaths.includes(window.location.pathname)) {
          window.location.href = '/login';
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [darkMode, location.pathname]);

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsCheckingAuth(true);
      try {
        const isValid = await validateToken();
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuthentication();
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        isHomePage={location.pathname === '/'}
      />
      <Routes>
        <Route path="/" element={<Home darkMode={darkMode} />} />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Login darkMode={darkMode} />
          } 
        />
        <Route 
          path="/signup" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Signup darkMode={darkMode} />
          } 
        />
        <Route path="/forgot-password" element={<ForgotPassword darkMode={darkMode} />} />
        <Route path="/reset-password/:token" element={<ResetPassword darkMode={darkMode} />} />
        <Route path="/terms" element={<Terms darkMode={darkMode} />} />
        <Route path="/about" element={<About darkMode={darkMode} />} />
        <Route path="/book-table" element={<BookTable darkMode={darkMode} />} />
        <Route path="/menu" element={<Menu darkMode={darkMode} />} />
        <Route path="/cart" element={<Cart darkMode={darkMode} />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <UserDashboard darkMode={darkMode} />
          </PrivateRoute>
        } />
        <Route path="/my-orders" element={
          <PrivateRoute>
            <UserOrders darkMode={darkMode} />
          </PrivateRoute>
        } />
        <Route path="/my-orders/:id" element={
          <PrivateRoute>
            <OrderDetail darkMode={darkMode} />
          </PrivateRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin/users" element={
          <PrivateRoute adminOnly={true}>
            <AdminUsers darkMode={darkMode} />
          </PrivateRoute>
        } />
        <Route path="/admin/dashboard" element={
          <PrivateRoute adminOnly={true}>
            <AdminDashboard darkMode={darkMode} />
          </PrivateRoute>
        } />
        <Route path="/admin/orders" element={
          <PrivateRoute adminOnly={true}>
            <Orders darkMode={darkMode} />
          </PrivateRoute>
        } />

        {/* Staff routes */}
        <Route path="/staff/dashboard" element={
          <PrivateRoute staffOnly={true}>
            <StaffDashboard darkMode={darkMode} />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? 'dark' : 'light'}
      />
    </div>
  );
};

export default App;