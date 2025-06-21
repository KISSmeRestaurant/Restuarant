import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, adminOnly = false, staffOnly = false }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  console.log('PrivateRoute check:', { user, token, adminOnly, staffOnly });

  if (!token || !user) {
    console.log('Redirecting to login - no token or user');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    console.log('Redirecting to home - not admin');
    return <Navigate to="/" replace />;
  }

  if (staffOnly && (user.role !== 'staff' && user.role !== 'admin')) {
    console.log('Redirecting to home - not staff/admin');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;