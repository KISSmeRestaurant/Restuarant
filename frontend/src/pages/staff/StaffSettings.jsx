import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaCog, 
  FaBell, 
  FaLock, 
  FaHistory, 
  FaSave, 
  FaCheck, 
  FaEye, 
  FaEyeSlash,
  FaArrowLeft,
  FaEdit,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaCalendarAlt
} from 'react-icons/fa';
import { MdAccountCircle, MdNotifications, MdSecurity, MdWork } from 'react-icons/md';
import { fetchWithAuth } from '../../services/auth';

const StaffSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [staffDetails, setStaffDetails] = useState(null);
  const [shiftHistory, setShiftHistory] = useState([]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      push: true,
      orderUpdates: true,
      shiftReminders: true
    }
  });

  // Load staff details and shift history
  useEffect(() => {
    const loadStaffData = async () => {
      try {
        setLoading(true);
        
        // Fetch staff details
        const staffResponse = await fetchWithAuth('http://localhost:5000/api/staff/me');
        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          setStaffDetails(staffData.data);
          setFormData(prev => ({
            ...prev,
            firstName: staffData.data.firstName || '',
            lastName: staffData.data.lastName || '',
            email: staffData.data.email || '',
            phone: staffData.data.phone || ''
          }));
        }

        // Fetch shift history
        const shiftResponse = await fetchWithAuth('http://localhost:5000/api/staff/shift/history?limit=10');
        if (shiftResponse.ok) {
          const shiftData = await shiftResponse.json();
          setShiftHistory(shiftData.data?.shifts || []);
        }
      } catch (error) {
        console.error('Error loading staff data:', error);
        setSaveStatus('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    loadStaffData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveStatus('');

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      };

      const response = await fetchWithAuth('http://localhost:5000/api/staff/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setStaffDetails(updatedData.data);
        setSaveStatus('Profile updated successfully!');
        
        // Update localStorage user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...updatedData.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        const errorData = await response.json();
        setSaveStatus('Error: ' + (errorData.message || 'Failed to update profile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveStatus('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setSaveStatus('Error: New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setSaveStatus('Error: Password must be at least 6 characters long');
      return;
    }

    try {
      setSaving(true);
      setSaveStatus('');

      const response = await fetchWithAuth('http://localhost:5000/api/staff/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        setSaveStatus('Password changed successfully!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        const errorData = await response.json();
        setSaveStatus('Error: ' + (errorData.message || 'Failed to change password'));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setSaveStatus('Error changing password');
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/staff/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Settings</h1>
            </div>
            
            {staffDetails && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {staffDetails.firstName?.charAt(0)}{staffDetails.lastName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{staffDetails.firstName} {staffDetails.lastName}</p>
                  <p className="text-sm text-gray-500 capitalize">{staffDetails.role}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Settings Sidebar */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              </div>
              <nav className="space-y-1 p-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center w-full px-4 py-2 text-left rounded-md transition-colors ${
                    activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaUser className="mr-3" />
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center w-full px-4 py-2 text-left rounded-md transition-colors ${
                    activeTab === 'security' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaLock className="mr-3" />
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center w-full px-4 py-2 text-left rounded-md transition-colors ${
                    activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaBell className="mr-3" />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('shifts')}
                  className={`flex items-center w-full px-4 py-2 text-left rounded-md transition-colors ${
                    activeTab === 'shifts' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaHistory className="mr-3" />
                  Shift History
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                      <MdAccountCircle className="mr-2 text-blue-600" />
                      Profile Information
                    </h3>
                    
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            <FaUser className="absolute left-3 top-3 text-gray-400" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            <FaUser className="absolute left-3 top-3 text-gray-400" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            <FaPhone className="absolute left-3 top-3 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {staffDetails && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Account Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Role:</span>
                              <span className="ml-2 capitalize font-medium">{staffDetails.role}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Member since:</span>
                              <span className="ml-2 font-medium">{formatDate(staffDetails.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md shadow-sm flex items-center transition-colors"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave className="mr-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                      <MdSecurity className="mr-2 text-blue-600" />
                      Security Settings
                    </h3>
                    
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <FaLock className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Password Security
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>Choose a strong password with at least 6 characters.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={formData.currentPassword}
                              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={formData.newPassword}
                              onChange={(e) => handleInputChange('newPassword', e.target.value)}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md shadow-sm flex items-center transition-colors"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Changing...
                            </>
                          ) : (
                            <>
                              <FaLock className="mr-2" />
                              Change Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                      <MdNotifications className="mr-2 text-blue-600" />
                      Notification Preferences
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-md font-medium text-gray-800 mb-3">Notification Settings</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Choose how you want to receive notifications about your work activities.
                        </p>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                              <p className="text-xs text-gray-500">Receive notifications via email</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.notifications.email}
                              onChange={(e) => handleNotificationChange('email', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                              <p className="text-xs text-gray-500">Receive browser push notifications</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.notifications.push}
                              onChange={(e) => handleNotificationChange('push', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Order Updates</label>
                              <p className="text-xs text-gray-500">Get notified about new orders and status changes</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.notifications.orderUpdates}
                              onChange={(e) => handleNotificationChange('orderUpdates', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Shift Reminders</label>
                              <p className="text-xs text-gray-500">Receive reminders about your shifts</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.notifications.shiftReminders}
                              onChange={(e) => handleNotificationChange('shiftReminders', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setSaveStatus('Notification preferences saved!')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-sm flex items-center transition-colors"
                        >
                          <FaSave className="mr-2" />
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'shifts' && (
                  <motion.div
                    key="shifts"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                      <MdWork className="mr-2 text-blue-600" />
                      Shift History
                    </h3>
                    
                    <div className="space-y-4">
                      {shiftHistory.length > 0 ? (
                        shiftHistory.map((shift, index) => (
                          <div key={shift._id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  <div className={`w-3 h-3 rounded-full ${
                                    shift.status === 'completed' ? 'bg-green-500' : 
                                    shift.status === 'active' ? 'bg-blue-500' : 'bg-gray-400'
                                  }`}></div>
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <FaCalendarAlt className="text-gray-400 text-sm" />
                                    <span className="font-medium text-gray-900">
                                      {formatDate(shift.startTime)}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                      <FaClock className="text-xs" />
                                      <span>Started: {formatTime(shift.startTime)}</span>
                                    </div>
                                    {shift.endTime && (
                                      <div className="flex items-center space-x-1">
                                        <FaClock className="text-xs" />
                                        <span>Ended: {formatTime(shift.endTime)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {shift.duration ? formatDuration(shift.duration) : 'In Progress'}
                                </div>
                                {shift.salary?.totalEarned && (
                                  <div className="text-sm text-green-600">
                                    £{shift.salary.totalEarned.toFixed(2)}
                                  </div>
                                )}
                                <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                  shift.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  shift.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {shift.status}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No shift history</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Your completed shifts will appear here.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save Status */}
              {saveStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 flex items-center px-4 py-2 rounded-md ${
                    saveStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {saveStatus.includes('Error') ? (
                    <span className="text-red-500 mr-2">⚠</span>
                  ) : (
                    <FaCheck className="text-green-500 mr-2" />
                  )}
                  {saveStatus}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffSettings;
