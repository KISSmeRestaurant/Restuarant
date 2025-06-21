import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdRestaurantMenu, MdEventNote, MdAccountCircle, MdEdit } from 'react-icons/md';
import { FaUser, FaUserShield, FaUserSlash } from 'react-icons/fa';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // For admin view
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
        setIsAdmin(userData.role === 'admin');

        // If admin, fetch all users
        if (userData.role === 'admin') {
          const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setUsers(usersData);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Update the local state to reflect the change
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      {/* User Header */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* User Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow rounded-lg overflow-hidden mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">My Profile</h3>
              <button className="text-pink-600 hover:text-pink-800">
                <MdEdit className="text-xl" />
              </button>
            </div>
          </div>
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="mt-1 text-sm text-gray-900">
                {user?.firstName} 
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last name</p>
              <p className="mt-1 text-sm text-gray-900">{user?.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="mt-1 text-sm text-gray-900">
                {user?.phone || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Postcode</p>
              <p className="mt-1 text-sm text-gray-900">
                {user?.postcode || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="mt-1 text-sm text-gray-900 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Admin Section - Only visible to admins */}
        {isAdmin && users.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow rounded-lg overflow-hidden mb-8"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          className="border rounded p-1 text-sm mr-2"
                        >
                          <option value="user">User</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button 
                          onClick={() => updateUserRole(user._id, 'staff')} 
                          className="text-blue-600 hover:text-blue-900 mr-2"
                          title="Make Staff"
                        >
                          <FaUserShield className="inline" />
                        </button>
                        <button 
                          onClick={() => updateUserRole(user._id, 'user')} 
                          className="text-green-600 hover:text-green-900 mr-2"
                          title="Make Regular User"
                        >
                          <FaUser className="inline" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <FaUserSlash className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate('/reservations')}
          >
            <div className="flex items-center mb-4">
              <MdEventNote className="text-3xl text-pink-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">My Reservations</h2>
            </div>
            <p className="text-gray-600">View and manage your table bookings</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate('/orders')}
          >
            <div className="flex items-center mb-4">
              <MdRestaurantMenu className="text-3xl text-pink-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Order History</h2>
            </div>
            <p className="text-gray-600">Track your previous orders</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate('/account')}
          >
            <div className="flex items-center mb-4">
              <MdAccountCircle className="text-3xl text-pink-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Account Settings</h2>
            </div>
            <p className="text-gray-600">Update your personal information</p>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
};

export default UserDashboard;