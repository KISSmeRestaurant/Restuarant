// Helper to ensure API URL has /api suffix
const getApiBaseUrl = () => {
  // Force localhost for testing the fix locally since Render is not deployed yet
  return 'http://localhost:5000/api';

  // const envUrl = import.meta.env.VITE_API_BASE_URL;
  // if (!envUrl) return 'http://localhost:5000/api';
  // return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

// API Configuration
const API_CONFIG = {
  // Use environment variable from .env file with robust handling
  BASE_URL: getApiBaseUrl(),

  // Fallback to production if primary fails (keeping the same as configured in env or default hardcoded one as last resort)
  FALLBACK_URL: 'https://restuarant-sh57.onrender.com/api'
};

// Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Enhanced fetch function with fallback logic and proper auth handling
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  // Check if token is expired
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Token expired');
  }

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  // Helper function to try a URL
  const tryFetch = async (url) => {
    const response = await fetch(url, defaultOptions);

    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      } catch {
        errorMessage = `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    return response;
  };

  try {
    // Try primary URL first
    return await tryFetch(`${API_CONFIG.BASE_URL}${endpoint}`);
  } catch (error) {
    console.warn(`Primary API failed (${API_CONFIG.BASE_URL}), trying fallback...`, error.message);

    // Try fallback URL if primary fails (but not for auth errors)
    if (error.message.includes('Authentication failed') || error.message.includes('Token expired')) {
      throw error;
    }

    try {
      return await tryFetch(`${API_CONFIG.FALLBACK_URL}${endpoint}`);
    } catch (fallbackError) {
      console.error('Both primary and fallback APIs failed:', fallbackError);
      throw new Error(`API request failed: ${fallbackError.message}`);
    }
  }
};

export default API_CONFIG;
