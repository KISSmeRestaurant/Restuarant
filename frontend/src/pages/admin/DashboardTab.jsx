import React from 'react';
import { FaUtensils, FaUserShield, FaCalendarAlt, FaChartLine, FaInfoCircle } from 'react-icons/fa';
import { MdFoodBank, MdDateRange } from 'react-icons/md';

const DashboardTab = ({ admin = {}, foodItems = [] }) => {
  // Safely calculate food items by category for the chart
  const foodByCategory = foodItems.reduce((acc, item) => {
    if (item?.category) {
      acc[item.category] = (acc[item.category] || 0) + 1;
    }
    return acc;
  }, {});

  // Helper function to format dates safely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  // Helper function to calculate days between dates
  const calculateDays = (dateString) => {
    if (!dateString) return 0;
    try {
      return Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  // Get most common category safely
  const mostCommonCategory = Object.keys(foodByCategory).length > 0 
    ? Object.entries(foodByCategory).sort((a, b) => b[1] - a[1])[0][0]
    : 'No categories';

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Food Items Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Food Items</p>
              <p className="text-3xl font-bold mt-2">{foodItems.length}</p>
            </div>
            <FaUtensils className="text-4xl opacity-20" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <FaChartLine className="mr-1" />
            <span>Updated in real-time</span>
          </div>
        </div>

        {/* Admin Since Card */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Admin Since</p>
              <p className="text-3xl font-bold mt-2">
                {admin?.createdAt 
                  ? new Date(admin.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'N/A'}
              </p>
            </div>
            <FaUserShield className="text-4xl opacity-20" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <MdDateRange className="mr-1" />
            <span>{calculateDays(admin?.createdAt)} days</span>
          </div>
        </div>

        {/* Last Login Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Last Login</p>
              <p className="text-3xl font-bold mt-2">
                {formatDate(admin?.lastLogin)}
              </p>
            </div>
            <FaCalendarAlt className="text-4xl opacity-20" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <FaInfoCircle className="mr-1" />
            <span>
              {admin?.lastLogin 
                ? `Today at ${new Date(admin.lastLogin).toLocaleTimeString()}`
                : 'No login data'}
            </span>
          </div>
        </div>

        {/* Categories Card */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Food Categories</p>
              <p className="text-3xl font-bold mt-2">{Object.keys(foodByCategory).length}</p>
            </div>
            <MdFoodBank className="text-4xl opacity-20" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <FaInfoCircle className="mr-1" />
            <span>Most items: {mostCommonCategory}</span>
          </div>
        </div>
      </div>

      {/* Admin Information Section */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-700">
          <h3 className="text-lg font-medium text-white flex items-center">
            <FaUserShield className="mr-2" />
            Admin Profile
          </h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Personal Information</h4>
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="mt-1 text-md text-gray-900 font-medium">
                  {admin?.firstName || 'N/A'} {admin?.lastName || ''}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-md text-gray-900 font-medium">
                  {admin?.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="mt-1 text-md text-gray-900 font-medium capitalize">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {admin?.role || 'unknown'}
                  </span>
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Contact Details</h4>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1 text-md text-gray-900 font-medium">
                  {admin?.phone || <span className="text-gray-400">Not provided</span>}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Postcode</p>
                <p className="mt-1 text-md text-gray-900 font-medium">
                  {admin?.postcode || <span className="text-gray-400">Not provided</span>}
                </p>
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Account Information</h4>
              <div>
                <p className="text-sm font-medium text-gray-500">Account Created</p>
                <p className="mt-1 text-md text-gray-900 font-medium">
                  {admin?.createdAt ? new Date(admin.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Active</p>
                <p className="mt-1 text-md text-gray-900 font-medium">
                  {admin?.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Account Age</p>
                <p className="mt-1 text-md text-gray-900 font-medium">
                  {admin?.createdAt ? `${calculateDays(admin.createdAt)} days` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Food Categories Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Food Items by Category</h3>
          {Object.keys(foodByCategory).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(foodByCategory).map(([category, count]) => (
                <div key={category} className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                    <span className="text-sm font-medium text-gray-500">{count} items</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(count / foodItems.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No food items with categories available</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full text-blue-600">
                <FaUserShield className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Admin logged in</p>
                <p className="text-sm text-gray-500">
                  {admin?.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'No login data'}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 p-2 rounded-full text-green-600">
                <FaUtensils className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Food items updated</p>
                <p className="text-sm text-gray-500">
                  {foodItems.length} item{foodItems.length !== 1 ? 's' : ''} currently in menu
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-purple-100 p-2 rounded-full text-purple-600">
                <MdDateRange className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">System status</p>
                <p className="text-sm text-gray-500">
                  All systems operational
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;