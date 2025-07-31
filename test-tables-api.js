// Test script to verify the /api/tables endpoint
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Test staff credentials (you'll need to replace with actual staff credentials)
const testStaffLogin = async () => {
  try {
    console.log('Testing /api/tables endpoint...\n');
    
    // First, let's try to login as staff (you'll need to provide actual credentials)
    console.log('Step 1: Login as staff user');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'staff@example.com', // Replace with actual staff email
        password: 'password123'     // Replace with actual staff password
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Staff login failed. Status:', loginResponse.status);
      const errorData = await loginResponse.text();
      console.log('Error:', errorData);
      
      // Let's try to test the endpoint without authentication first
      console.log('\nStep 2: Testing /api/tables without authentication');
      const tablesResponse = await fetch(`${BASE_URL}/tables`);
      console.log('Tables endpoint status (no auth):', tablesResponse.status);
      
      if (tablesResponse.status === 401) {
        console.log('✅ Endpoint correctly requires authentication');
      }
      
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Staff login successful');

    // Test the /api/tables endpoint
    console.log('\nStep 2: Testing /api/tables with staff token');
    const tablesResponse = await fetch(`${BASE_URL}/tables`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Tables endpoint status:', tablesResponse.status);
    
    if (tablesResponse.ok) {
      const tablesData = await tablesResponse.json();
      console.log('✅ Tables endpoint working correctly');
      console.log('Response:', JSON.stringify(tablesData, null, 2));
    } else {
      console.log('❌ Tables endpoint failed');
      const errorData = await tablesResponse.text();
      console.log('Error:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

// Test without authentication first
const testWithoutAuth = async () => {
  try {
    console.log('Testing /api/tables without authentication...');
    const response = await fetch(`${BASE_URL}/tables`);
    console.log('Status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Endpoint correctly requires authentication');
    } else {
      console.log('❌ Endpoint should require authentication');
    }
    
    const data = await response.text();
    console.log('Response:', data);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testWithoutAuth();
