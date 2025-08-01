const fetch = require('node-fetch');

const BASE_URL = 'https://restuarant-sh57.onrender.com/api';

async function testPermissionsAPI() {
  try {
    console.log('=== Testing Staff Permissions API ===\n');

    // First, login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@kissme.com',
        password: 'Admin@1234'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Admin login successful');

    // Get all users to find staff
    console.log('\n2. Fetching all users...');
    const usersResponse = await fetch(`${BASE_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!usersResponse.ok) {
      throw new Error(`Failed to fetch users: ${usersResponse.status}`);
    }

    const usersData = await usersResponse.json();
    const staffUsers = usersData.data.filter(user => user.role === 'staff');
    
    console.log(`✅ Found ${staffUsers.length} staff users`);
    
    if (staffUsers.length === 0) {
      console.log('❌ No staff users found. Creating one...');
      
      // Create a test staff user
      const createUserResponse = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'Staff',
          email: 'teststaff@example.com',
          password: 'TestStaff123!',
          passwordConfirm: 'TestStaff123!',
          phone: '1234567890',
          postcode: 'SW1A 1AA',
          termsAccepted: true
        })
      });

      if (createUserResponse.ok) {
        const newUser = await createUserResponse.json();
        
        // Update role to staff
        const roleUpdateResponse = await fetch(`${BASE_URL}/admin/users/${newUser.data.user._id}/role`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: 'staff' })
        });

        if (roleUpdateResponse.ok) {
          const updatedUser = await roleUpdateResponse.json();
          staffUsers.push(updatedUser.data);
          console.log('✅ Created test staff user');
        }
      }
    }

    if (staffUsers.length === 0) {
      throw new Error('No staff users available for testing');
    }

    const testStaff = staffUsers[0];
    console.log(`\n3. Testing permissions for staff: ${testStaff.firstName} ${testStaff.lastName} (${testStaff.email})`);
    console.log(`Current permissions:`, testStaff.permissions);

    // Test 1: Try dedicated permissions endpoint
    console.log('\n4. Testing dedicated permissions endpoint...');
    const permissionsResponse = await fetch(`${BASE_URL}/admin/staff/${testStaff._id}/permissions`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tableAccess: true,
        dashboardAccess: false
      })
    });

    console.log(`Permissions endpoint status: ${permissionsResponse.status}`);
    
    if (permissionsResponse.status === 404) {
      console.log('⚠️ Dedicated permissions endpoint not found (404) - this is expected if deployment hasn\'t updated');
      
      // Test 2: Try fallback role endpoint
      console.log('\n5. Testing fallback role endpoint with permissions...');
      const roleResponse = await fetch(`${BASE_URL}/admin/users/${testStaff._id}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: 'staff',
          permissions: {
            tableAccess: true,
            dashboardAccess: false
          }
        })
      });

      console.log(`Role endpoint status: ${roleResponse.status}`);
      
      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        console.log('✅ Fallback role endpoint worked');
        console.log('Updated user data:', JSON.stringify(roleData.data, null, 2));
      } else {
        const errorText = await roleResponse.text();
        console.log('❌ Fallback role endpoint failed:', errorText);
      }
    } else if (permissionsResponse.ok) {
      const permissionsData = await permissionsResponse.json();
      console.log('✅ Dedicated permissions endpoint worked');
      console.log('Updated user data:', JSON.stringify(permissionsData.data, null, 2));
    } else {
      const errorText = await permissionsResponse.text();
      console.log('❌ Dedicated permissions endpoint failed:', errorText);
    }

    // Test 3: Verify the changes by fetching users again
    console.log('\n6. Verifying changes by fetching users again...');
    const verifyResponse = await fetch(`${BASE_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const updatedStaff = verifyData.data.find(user => user._id === testStaff._id);
      console.log('✅ Verification successful');
      console.log('Final staff permissions:', updatedStaff.permissions);
    } else {
      console.log('❌ Verification failed');
    }

    // Test 4: Test staff login and dashboard access
    console.log('\n7. Testing staff login and dashboard access...');
    const staffLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testStaff.email,
        password: 'TestStaff123!' // This will only work if we created the test user
      })
    });

    if (staffLoginResponse.ok) {
      const staffLoginData = await staffLoginResponse.json();
      const staffToken = staffLoginData.token;
      console.log('✅ Staff login successful');

      // Test staff details endpoint
      const staffDetailsResponse = await fetch(`${BASE_URL}/staff/me`, {
        headers: {
          'Authorization': `Bearer ${staffToken}`
        }
      });

      if (staffDetailsResponse.ok) {
        const staffDetails = await staffDetailsResponse.json();
        console.log('✅ Staff details endpoint working');
        console.log('Staff permissions from /staff/me:', staffDetails.data.permissions);
      } else {
        console.log('❌ Staff details endpoint failed:', staffDetailsResponse.status);
      }
    } else {
      console.log('⚠️ Staff login failed (expected if using existing staff user)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPermissionsAPI();
