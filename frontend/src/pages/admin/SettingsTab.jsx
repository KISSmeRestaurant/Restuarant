import { useState } from 'react';
import { FaCog, FaBell, FaLock, FaInfoCircle, FaBusinessTime } from 'react-icons/fa';
import { MdEmail, MdPayment, MdReceipt, MdPeople } from 'react-icons/md';

const SettingsTab = () => {
  const [activeSetting, setActiveSetting] = useState('general');
  const [formData, setFormData] = useState({
    restaurantName: 'Gourmet Delight',
    contactEmail: 'contact@gourmetdelight.com',
    phoneNumber: '+1 (555) 123-4567',
    address: '123 Food Street, Culinary City',
    openingHours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '21:00' }
    },
    taxRate: 8.5,
    deliveryFee: 3.99,
    minOrderAmount: 15.00,
    notificationPreferences: {
      email: true,
      sms: false,
      push: true
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the updated settings to your backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
          </div>
          <nav className="space-y-1 p-2">
            <button
              onClick={() => setActiveSetting('general')}
              className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeSetting === 'general' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FaCog className="mr-3" />
              General Settings
            </button>
            <button
              onClick={() => setActiveSetting('hours')}
              className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeSetting === 'hours' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FaBusinessTime className="mr-3" />
              Business Hours
            </button>
            <button
              onClick={() => setActiveSetting('notifications')}
              className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeSetting === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FaBell className="mr-3" />
              Notifications
            </button>
            <button
              onClick={() => setActiveSetting('payments')}
              className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeSetting === 'payments' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <MdPayment className="mr-3" />
              Payments & Fees
            </button>
            <button
              onClick={() => setActiveSetting('security')}
              className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeSetting === 'security' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FaLock className="mr-3" />
              Security
            </button>
            <button
              onClick={() => setActiveSetting('staff')}
              className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeSetting === 'staff' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <MdPeople className="mr-3" />
              Staff Management
            </button>
            <button
              onClick={() => setActiveSetting('about')}
              className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeSetting === 'about' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FaInfoCircle className="mr-3" />
              About & Legal
            </button>
          </nav>
        </div>

        {/* Main Settings Content */}
        <div className="flex-1 p-6">
          <form onSubmit={handleSubmit}>
            {activeSetting === 'general' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">General Restaurant Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                    <input
                      type="text"
                      name="restaurantName"
                      value={formData.restaurantName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSetting === 'hours' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Business Hours</h3>
                <div className="space-y-4">
                  {Object.entries(formData.openingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center">
                      <div className="w-24">
                        <label className="block text-sm font-medium text-gray-700 capitalize">{day}</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSetting === 'notifications' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      name="email"
                      checked={formData.notificationPreferences.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notificationPreferences: {
                          ...prev.notificationPreferences,
                          email: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                      Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      name="sms"
                      checked={formData.notificationPreferences.sms}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notificationPreferences: {
                          ...prev.notificationPreferences,
                          sms: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-700">
                      SMS Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pushNotifications"
                      name="push"
                      checked={formData.notificationPreferences.push}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notificationPreferences: {
                          ...prev.notificationPreferences,
                          push: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-700">
                      Push Notifications
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSetting === 'payments' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Payments & Fees</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="deliveryFee"
                      value={formData.deliveryFee}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="minOrderAmount"
                      value={formData.minOrderAmount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSetting === 'security' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">Change Password</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">Two-Factor Authentication</h4>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enable2FA"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enable2FA" className="ml-2 block text-sm text-gray-700">
                        Enable Two-Factor Authentication
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSetting === 'staff' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Staff Management</h3>
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
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                        <td className="px-6 py-4 whitespace-nowrap">john@example.com</td>
                        <td className="px-6 py-4 whitespace-nowrap">Manager</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Remove</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Jane Smith</td>
                        <td className="px-6 py-4 whitespace-nowrap">jane@example.com</td>
                        <td className="px-6 py-4 whitespace-nowrap">Staff</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Remove</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-6">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    Add New Staff Member
                  </button>
                </div>
              </div>
            )}

            {activeSetting === 'about' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">About & Legal</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">Terms & Conditions</h4>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows="6"
                      placeholder="Enter your terms and conditions here..."
                    ></textarea>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">Privacy Policy</h4>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows="6"
                      placeholder="Enter your privacy policy here..."
                    ></textarea>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">App Version</h4>
                    <p className="text-sm text-gray-600">1.2.3</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;