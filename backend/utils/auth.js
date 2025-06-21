export const scheduleTokenRefresh = (token) => {
  try {
    clearTimeout(refreshTimeout);
    
    const { exp } = jwtDecode(token);
    const expiresIn = exp - Math.floor(Date.now() / 1000);
    
    const refreshTime = (expiresIn - 600) * 1000;
    
    if (expiresIn > 600) {
      refreshTimeout = setTimeout(async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          if (response.ok) {
            const { token: newToken } = await response.json();
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
            window.dispatchEvent(new Event('storage'));
            scheduleTokenRefresh(newToken);
          } else {
            // Clear auth state if refresh fails
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('storage'));
            window.location.href = '/login';
          }
        } catch (err) {
          console.error('Silent refresh failed:', err);
        }
      }, refreshTime);
    }
  } catch (err) {
    console.error('Error scheduling token refresh:', err);
  }
};