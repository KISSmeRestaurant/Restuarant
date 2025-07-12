// services/auth.js

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Validate current token
export const validateToken = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) return false;
  
  if (isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    return false;
  }
  
  return true;
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  // Check if token is expired before making request
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/login';
    throw new Error('Token expired');
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  let response = await fetch(url, { ...options, headers });

  // If token expired, try to refresh it
  if (response.status === 401) {
    try {
      const refreshResponse = await fetch('https://restuarant-sh57.onrender.com/api/refresh-token', {
        method: 'POST',
        credentials: 'include'
      });

      if (!refreshResponse.ok) throw new Error('Refresh failed');

      const { token: newToken } = await refreshResponse.json();
      localStorage.setItem('token', newToken);

      // Retry original request with new token
      headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    } catch (refreshError) {
      // If refresh fails, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-change'));
      window.location.href = '/login';
      throw refreshError;
    }
  }

  return response;
};
// Add this to your auth service or a utility file
export const logout = async () => {
  try {
    await fetch('https://restuarant-sh57.onrender.com/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectAfterLogin');
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/login'; // Full page reload to clear state
  }
};