import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { validateToken } from '../../services/auth';

const PrivateRoute = ({ children, adminOnly = false, staffOnly = false }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          setIsAuthenticated(false);
          setIsValidating(false);
          return;
        }

        // Validate token
        const isValid = await validateToken();
        if (isValid) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsValidating(false);
      }
    };

    checkAuth();
  }, []);

  if (isValidating) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (staffOnly && user.role !== 'staff') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
