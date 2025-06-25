import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import ResetPassword from './pages/ResetPassword';
import Terms from './pages/Terms';  
import About from './pages/About';
import BookTable from './pages/BookaTable';
import Menu from './pages/Menu';
import Orders from './pages/admin/Orders';
import StaffDashboard from './pages/staff/StaffDashboard';
import Cart from './components/common/Cart';
import OrderDetail from './pages/users/OrderDetail';  
import UserOrders from './pages/users/UserOrders';  
import './styles/global.css';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for dark mode preference
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }

    // Custom event listener for auth changes
    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login if token is removed (like when logging out from another tab)
        if (window.location.pathname !== '/login' && 
            window.location.pathname !== '/signup') {
          window.location.href = '/login';
        }
      }
    };

    // Listen for both storage changes and custom auth-change events
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} />} />
          <Route 
            path="/login" 
            element={
              localStorage.getItem('user') ? 
                <Navigate to="/" replace /> : 
                <Login darkMode={darkMode} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              localStorage.getItem('user') ? 
                <Navigate to="/" replace /> : 
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

          {/* Protected user route */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <UserDashboard darkMode={darkMode} />
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

          <Route path="/orders" element={
            <PrivateRoute>
              <Orders darkMode={darkMode} />
            </PrivateRoute>
          } />
          
          <Route path="/staff/dashboard" element={
            <PrivateRoute staffOnly={true}>
              <StaffDashboard darkMode={darkMode} />
            </PrivateRoute>
          } />

          <Route path="/admin/orders" element={
            <PrivateRoute adminOnly={true}>
              <Orders darkMode={darkMode} />
            </PrivateRoute>
          } />

          // Add these routes to your existing App component
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
        </Routes>
      </div>
    </Router>

    
  );
  <ToastContainer />
};

export default App;