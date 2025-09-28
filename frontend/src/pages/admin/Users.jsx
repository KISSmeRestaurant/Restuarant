import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaUserEdit, 
  FaUserSlash, 
  FaUserShield, 
  FaPhone, 
  FaSearch,
  FaFilter,
  FaRegClock,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaClock
} from 'react-icons/fa';
import { RiUserStarFill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('https://restuarant-sh57.onrender.com/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        
        // Ensure permissions are properly set for all users
        const usersWithPermissions = data.data.map(user => ({
          ...user,
          permissions: user.permissions || {
            tableAccess: false,
            dashboardAccess: false
          }
        }));
        
        console.log('Fetched users with permissions:', usersWithPermissions);
        setUsers(usersWithPermissions);
        setFilteredUsers(usersWithPermissions);
      } catch (err) {
        setError(err.message);
        toast.error(`Error fetching users: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  // Apply filters and search
  useEffect(() => {
    let result = users;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.phone && user.phone.includes(term))
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 opacity-30" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="ml-1" /> 
      : <FaSortDown className="ml-1" />;
  };

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://restuarant-sh57.onrender.com/api/admin/users/${userId}/role`, {
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

      const data = await response.json();
      
      // Update the local state to reflect the change
      setUsers(users.map(user => 
        user._id === userId ? { ...user, ...data.data } : user
      ));
      
      toast.success(`User role updated to ${newRole}`);
      setEditingUserId(null); // Exit edit mode
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating role: ${err.message}`);
    }
  };

  // Update staff permissions using the working role endpoint as a workaround
  const updateStaffPermissions = async (userId, permissions) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Updating permissions for user:', userId, 'with permissions:', permissions);
      
      // Validate that at least one permission is enabled
      if (!permissions.tableAccess && !permissions.dashboardAccess) {
        toast.error('Staff must have at least one permission enabled');
        return;
      }

      // Show loading state
      const loadingToast = toast.loading('Updating permissions...');
      
      // WORKAROUND: Since /api/admin/staff/:id/permissions is not working,
      // we'll use the working /api/admin/users/:id/role endpoint with permissions
      const response = await fetch(`https://restuarant-sh57.onrender.com/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: 'staff', // Keep the role as staff
          permissions: {
            tableAccess: permissions.tableAccess,
            dashboardAccess: permissions.dashboardAccess
          }
        })
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `Failed to update staff permissions: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);

      // Ensure we have the updated user data
      if (!data.data) {
        throw new Error('Invalid response format from server');
      }

      // Update the local state immediately to reflect the change
      setUsers(prevUsers => prevUsers.map(user => {
        if (user._id === userId) {
          const updatedUser = { 
            ...user, 
            ...data.data, // Use the response data which should include updated permissions
            permissions: data.data.permissions || {
              tableAccess: permissions.tableAccess,
              dashboardAccess: permissions.dashboardAccess
            }
          };
          console.log('Updated user in state:', updatedUser);
          return updatedUser;
        }
        return user;
      }));
      
      const enabledPermissions = [];
      if (permissions.tableAccess) enabledPermissions.push('Tables');
      if (permissions.dashboardAccess) enabledPermissions.push('Kitchen');
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Staff permissions updated: ${enabledPermissions.join(', ')}`);
      
    } catch (err) {
      console.error('Permission update error:', err);
      setError(err.message);
      toast.error(`Error updating permissions: ${err.message}`);
      
      // Revert the UI state by refetching users to ensure consistency
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://restuarant-sh57.onrender.com/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.data);
          setFilteredUsers(data.data);
        }
      } catch (fetchErr) {
        console.error('Error refetching users:', fetchErr);
      }
    }
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://restuarant-sh57.onrender.com/api/admin/users/${userToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      // Handle empty response (204 No Content)
      if (response.status === 204) {
        setUsers(users.filter(user => user._id !== userToDelete));
        toast.success('User deleted successfully');
        setShowDeleteModal(false);
        setUserToDelete(null);
        return;
      }

      // Handle other responses
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      setUsers(users.filter(user => user._id !== userToDelete));
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Error deleting user');
    } finally {
      setIsDeleting(false);
    }
  };

  const startEditing = (userId) => {
    setEditingUserId(userId);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
  };

  const confirmDelete = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <RiUserStarFill className="text-purple-600" />;
      case 'staff': return <FaUserShield className="text-blue-500" />;
      default: return <FaUser className="text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaRegTimesCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">User Management</h2>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="staff">Staff</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('firstName')}
              >
                <div className="flex items-center">
                  User
                  {getSortIcon('firstName')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('role')}
              >
                <div className="flex items-center">
                  Role
                  {getSortIcon('role')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('createdAt')}
              >
                <div className="flex items-center">
                  Joined
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {user._id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaPhone className="text-gray-400 mr-2 text-sm" />
                      <span className="text-sm text-gray-900">
                        {user.phone || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      {editingUserId === user._id ? (
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          className="border rounded p-1 text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="user">User</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.role === 'staff'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{user.role}</span>
                        </span>
                      )}
                      
                      {/* Staff Permissions */}
                      {user.role === 'staff' && (
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`table-${user._id}`}
                              checked={user.permissions?.tableAccess || false}
                              onChange={(e) => updateStaffPermissions(user._id, {
                                tableAccess: e.target.checked,
                                dashboardAccess: user.permissions?.dashboardAccess || false
                              })}
                              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`table-${user._id}`} className="text-xs text-gray-600">
                              Tables
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`dashboard-${user._id}`}
                              checked={user.permissions?.dashboardAccess || false}
                              onChange={(e) => updateStaffPermissions(user._id, {
                                tableAccess: user.permissions?.tableAccess || false,
                                dashboardAccess: e.target.checked
                              })}
                              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`dashboard-${user._id}`} className="text-xs text-gray-600">
                              Kitchen
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 flex items-center">
                      <FaRegClock className="mr-1 text-gray-400" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {/* Account Status */}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? (
                          <>
                            <FaRegCheckCircle className="mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <FaRegTimesCircle className="mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                      
                      {/* Online Status */}
                      <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                        user.isOnline ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1 mt-0.5 ${
                          user.isOnline ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        {user.isOnline ? 'Online' : 'Offline'}
                      </span>
                      
                      {/* Staff Shift Status */}
                      {user.role === 'staff' && user.hasActiveShift && (
                        <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-yellow-100 text-yellow-800">
                          <FaClock className="mr-1 mt-0.5" />
                          On Shift
                        </span>
                      )}
                      
                      {/* Last Seen */}
                      {user.lastSeen && !user.isOnline && (
                        <span className="text-xs text-gray-500">
                          Last seen: {new Date(user.lastSeen).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {editingUserId === user._id ? (
                        <button 
                          onClick={cancelEditing}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button 
                          onClick={() => startEditing(user._id)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="Edit role"
                        >
                          <FaUserEdit />
                        </button>
                      )}
                      <button 
                        onClick={() => confirmDelete(user._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete user"
                        disabled={user.role === 'admin'}
                      >
                        <FaUserSlash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  No users found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm User Deletion</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                className="px-4 py-2 bg-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
