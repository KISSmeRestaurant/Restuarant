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
import Tables from './pages/staff/Tables';
import Cart from './components/common/Cart';
import OrderDetail from './pages/users/OrderDetail';  
import UserOrders from './pages/users/UserOrders';  
import UserFeedback from './pages/users/UserFeedback';
import { validateToken } from './services/auth';
import { SettingsProvider } from './contexts/SettingsContext';
import './styles/global.css';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <SettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SettingsProvider>
  );
};

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();

  useEffect(() => {
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
  }, [location.pathname]);

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

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50">
      <Navbar 
        isHomePage={location.pathname === '/'}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Login />
          } 
        />
        <Route 
          path="/signup" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Signup />
          } 
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/book-table" element={<BookTable />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/feedback" element={<UserFeedback />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        } />
        <Route path="/my-orders" element={
          <PrivateRoute>
            <UserOrders />
          </PrivateRoute>
        } />
        <Route path="/my-orders/:id" element={
          <PrivateRoute>
            <OrderDetail />
          </PrivateRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin/users" element={
          <PrivateRoute adminOnly={true}>
            <AdminUsers />
          </PrivateRoute>
        } />
        <Route path="/admin/dashboard" element={
          <PrivateRoute adminOnly={true}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/orders" element={
          <PrivateRoute adminOnly={true}>
            <Orders />
          </PrivateRoute>
        } />

        {/* Staff routes */}
        <Route path="/staff/dashboard" element={
          <PrivateRoute staffOnly={true}>
            <StaffDashboard />
          </PrivateRoute>
        } />
        <Route path="/staff/tables" element={
          <PrivateRoute staffOnly={true}>
            <Tables />
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
        theme="light"
      />
    </div>
  );
};

export default App;
