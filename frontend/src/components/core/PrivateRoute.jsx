import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, adminOnly = false, staffOnly = false }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
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