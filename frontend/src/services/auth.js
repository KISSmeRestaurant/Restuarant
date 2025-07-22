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

// Rate limit aware fetch with retry logic
export const fetchWithAuth = async (url, options = {}, retryCount = 0) => {
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

  try {
    let response = await fetch(url, { 
      ...options, 
      headers,
      timeout: 10000 // 10 second timeout
    });

    // Handle rate limiting
    if (response.status === 429 && retryCount < 3) {
      const retryAfter = response.headers.get('retry-after') || Math.pow(2, retryCount);
      console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
      
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return fetchWithAuth(url, options, retryCount + 1);
    }

    // If token expired, try to refresh it
    if (response.status === 401) {
      try {
        // Use relative URL for development proxy, full URL for production
        const refreshUrl = import.meta.env.DEV 
          ? '/api/refresh-token' 
          : 'https://restuarant-sh57.onrender.com/api/refresh-token';
        
        const refreshResponse = await fetch(refreshUrl, {
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
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('Network error, possibly local server not available');
      throw new Error('Network error - please check if the server is running');
    }
    throw error;
  }
};

// Enhanced login function with rate limit handling
export const login = async (credentials) => {
  const loginUrl = import.meta.env.DEV 
    ? '/api/auth/login' 
    : 'https://restuarant-sh57.onrender.com/api/auth/login';

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
      timeout: 10000
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after') || 60;
      throw new Error(`Too many login attempts. Please try again after ${retryAfter} seconds.`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error - please check if the server is running');
    }
    throw error;
  }
};

// Add this to your auth service or a utility file
export const logout = async () => {
  try {
    // Use relative URL for development proxy, full URL for production
    const logoutUrl = import.meta.env.DEV 
      ? '/api/auth/logout' 
      : 'https://restuarant-sh57.onrender.com/api/auth/logout';
    
    await fetch(logoutUrl, {
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
