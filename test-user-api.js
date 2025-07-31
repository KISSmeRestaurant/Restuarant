// Test script to verify user API endpoints
const testUserAPI = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  // You'll need to replace this with a valid token from your application
  const token = 'YOUR_JWT_TOKEN_HERE';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    console.log('Testing /api/users/me endpoint...');
    const userResponse = await fetch(`${baseURL}/users/me`, { headers });
    console.log('User endpoint status:', userResponse.status);
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('User data:', userData);
    } else {
      const errorData = await userResponse.text();
      console.log('User endpoint error:', errorData);
    }

    console.log('\nTesting /api/orders/my-orders endpoint...');
    const ordersResponse = await fetch(`${baseURL}/orders/my-orders`, { headers });
    console.log('Orders endpoint status:', ordersResponse.status);
    
    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      console.log('Orders data:', ordersData);
    } else {
      const errorData = await ordersResponse.text();
      console.log('Orders endpoint error:', errorData);
    }

    console.log('\nTesting /api/reservations/my-reservations endpoint...');
    const reservationsResponse = await fetch(`${baseURL}/reservations/my-reservations`, { headers });
    console.log('Reservations endpoint status:', reservationsResponse.status);
    
    if (reservationsResponse.ok) {
      const reservationsData = await reservationsResponse.json();
      console.log('Reservations data:', reservationsData);
    } else {
      const errorData = await reservationsResponse.text();
      console.log('Reservations endpoint error:', errorData);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Test without token to see auth error
const testWithoutToken = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('\n=== Testing without token ===');
    const response = await fetch(`${baseURL}/users/me`);
    console.log('Status without token:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Test without token failed:', error);
  }
};

// Test health endpoint
const testHealth = async () => {
  try {
    console.log('\n=== Testing health endpoint ===');
    const response = await fetch('http://localhost:5000/api/health');
    console.log('Health endpoint status:', response.status);
    const data = await response.json();
    console.log('Health response:', data);
  } catch (error) {
    console.error('Health test failed:', error);
  }
};

// Run tests
console.log('Starting API tests...');
testHealth();
testWithoutToken();
// testUserAPI(); // Uncomment and add valid token to test authenticated endpoints
