const fetch = require('node-fetch');

const BASE_URL = 'https://restuarant-sh57.onrender.com/api';

// Test staff permissions endpoint
const testStaffPermissions = async () => {
  try {
    console.log('Testing staff permissions endpoint...');
    
    // You'll need to replace this with a valid admin token
    const adminToken = 'YOUR_ADMIN_TOKEN_HERE';
    const staffUserId = '683d723619e34e34184c8b84';
    
    console.log(`Testing PATCH ${BASE_URL}/admin/staff/${staffUserId}/permissions`);
    
    const response = await fetch(`${BASE_URL}/admin/staff/${staffUserId}/permissions`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        tableAccess: true,
        dashboardAccess: false
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Staff permissions endpoint is working!');
    } else {
      console.log('❌ Staff permissions endpoint failed');
      if (response.status === 404) {
        console.log('Route not found - check if server has been restarted');
      }
    }
    
  } catch (error) {
    console.error('Error testing staff permissions:', error.message);
  }
};

// Test if the route exists by checking available routes
const testRouteExists = async () => {
  try {
    console.log('\nTesting if admin routes are accessible...');
    
    // Test a known working admin route first
    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer YOUR_ADMIN_TOKEN_HERE`
      }
    });
    
    console.log('Admin users endpoint status:', response.status);
    
    if (response.status === 401) {
      console.log('⚠️  Need valid admin token to test properly');
    } else if (response.status === 404) {
      console.log('❌ Admin routes not found - server issue');
    } else {
      console.log('✅ Admin routes are accessible');
    }
    
  } catch (error) {
    console.error('Error testing admin routes:', error.message);
  }
};

// Run tests
testRouteExists();
testStaffPermissions();

console.log('\n📝 To test properly, you need to:');
console.log('1. Get a valid admin token by logging in as admin');
console.log('2. Replace YOUR_ADMIN_TOKEN_HERE with the actual token');
console.log('3. Replace the staffUserId with an actual staff user ID');
console.log('4. Run: node test-staff-permissions.js');
