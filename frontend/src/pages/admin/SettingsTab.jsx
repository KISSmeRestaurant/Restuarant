import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaBell, FaLock, FaInfoCircle, FaBusinessTime, FaSave, FaCheck, FaPoundSign, FaCalculator, FaUndo } from 'react-icons/fa';
import { MdEmail, MdPayment, MdReceipt, MdNotifications, MdSecurity, MdLocationOn, MdSchedule } from 'react-icons/md';
import settingsService from '../../services/settings';
import { useSettings } from '../../contexts/SettingsContext';

const SettingsTab = () => {
  const { settings: contextSettings, updateSettings, loadSettings } = useSettings();
  const [activeSetting, setActiveSetting] = useState('general');
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    restaurantInfo: {
      name: 'KissMe Restaurant',
      email: 'contact@kissme.com',
      phone: '+44 20 7946 0958',
      address: {
        street: '123 Food Street',
        city: 'London',
        postcode: 'SW1A 1AA',
        country: 'United Kingdom'
      },
      description: 'A modern restaurant with a focus on premium food tastes'
    },
    businessHours: {
      timezone: 'Europe/London',
      schedule: {
        monday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
        saturday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
        sunday: { isOpen: true, openTime: '10:00', closeTime: '21:00' }
      }
    },
    taxSettings: {
      country: 'UK',
      vatRates: {
        standard: { rate: 20.0, description: 'Standard VAT rate for most items' },
        reduced: { rate: 5.0, description: 'Reduced VAT rate for certain food items' },
        zero: { rate: 0.0, description: 'Zero VAT rate for basic food items' }
      },
      defaultVatRate: 'standard',
      vatNumber: '',
      includeVatInPrices: true
    },
    paymentSettings: {
      currency: 'GBP',
      currencySymbol: '£',
      deliveryFee: 3.99,
      freeDeliveryThreshold: 25.00,
      minimumOrderAmount: 15.00,
      serviceCharge: {
        enabled: false,
        rate: 12.5,
        description: 'Optional service charge'
      },
      acceptedPaymentMethods: ['card', 'cash'],
      cardProcessingFee: {
        enabled: false,
        rate: 2.9
      }
    },
    notificationSettings: {
      email: {
        enabled: true,
        orderConfirmation: true,
        orderStatusUpdates: true,
        dailyReports: true
      },
      sms: {
        enabled: false,
        orderConfirmation: false,
        orderStatusUpdates: false
      },
      push: {
        enabled: true,
        orderNotifications: true,
        promotions: false
      }
    }
  });

  // Load settings on component mount
  useEffect(() => {
    loadSettingsData();
  }, []);

  // Update form data when context settings change
  useEffect(() => {
    if (contextSettings) {
      setSettings(contextSettings);
      setFormData(contextSettings);
    }
  }, [contextSettings]);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      await loadSettings(); // Use context method
    } catch (error) {
      console.error('Error loading settings:', error);
      setSaveStatus('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value, subField = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (subField) {
        newData[section] = {
          ...newData[section],
          [field]: {
            ...newData[section][field],
            [subField]: value
          }
        };
      } else {
        newData[section] = {
          ...newData[section],
          [field]: value
        };
      }
      return newData;
    });
  };

  const handleTimeChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        schedule: {
          ...prev.businessHours.schedule,
          [day]: {
            ...prev.businessHours.schedule[day],
            [field]: value
          }
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveStatus('');
      
      let response;
      switch (activeSetting) {
        case 'general':
          response = await settingsService.updateRestaurantInfo(formData.restaurantInfo);
          break;
        case 'hours':
          response = await settingsService.updateBusinessHours(formData.businessHours);
          break;
        case 'tax':
          response = await settingsService.updateTaxSettings(formData.taxSettings);
          break;
        case 'payments':
          response = await settingsService.updatePaymentSettings(formData.paymentSettings);
          break;
        default:
          response = await settingsService.updateSettings(formData);
      }
      
      if (response.status === 'success') {
        setSaveStatus('Settings saved successfully!');
        // Update the global settings context
        await updateSettings(response.data || formData);
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      try {
        setSaving(true);
        const response = await settingsService.resetSettings();
        if (response.status === 'success') {
          setFormData(response.data);
          // Update the global settings context
          await updateSettings(response.data);
          setSaveStatus('Settings reset to default values');
          setTimeout(() => setSaveStatus(''), 3000);
        }
      } catch (error) {
        console.error('Error resetting settings:', error);
        setSaveStatus('Error resetting settings: ' + error.message);
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
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
              onClick={() => setActiveSetting('tax')}
              className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeSetting === 'tax' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FaPoundSign className="mr-3" />
              UK Tax Settings
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
                <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <MdLocationOn className="mr-2 text-blue-600" />
                  General Restaurant Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                    <input
                      type="text"
                      value={formData.restaurantInfo?.name || ''}
                      onChange={(e) => handleInputChange('restaurantInfo', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={formData.restaurantInfo?.email || ''}
                      onChange={(e) => handleInputChange('restaurantInfo', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (UK)</label>
                    <input
                      type="tel"
                      value={formData.restaurantInfo?.phone || ''}
                      onChange={(e) => handleInputChange('restaurantInfo', 'phone', e.target.value)}
                      placeholder="+44 20 7946 0958"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={formData.restaurantInfo?.address?.street || ''}
                      onChange={(e) => handleInputChange('restaurantInfo', 'address', e.target.value, 'street')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.restaurantInfo?.address?.city || ''}
                      onChange={(e) => handleInputChange('restaurantInfo', 'address', e.target.value, 'city')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                    <input
                      type="text"
                      value={formData.restaurantInfo?.address?.postcode || ''}
                      onChange={(e) => handleInputChange('restaurantInfo', 'address', e.target.value, 'postcode')}
                      placeholder="SW1A 1AA"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.restaurantInfo?.description || ''}
                      onChange={(e) => handleInputChange('restaurantInfo', 'description', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSetting === 'hours' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <MdSchedule className="mr-2 text-blue-600" />
                  Business Hours (UK Time)
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={formData.businessHours?.timezone || 'Europe/London'}
                    onChange={(e) => handleInputChange('businessHours', 'timezone', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                  </select>
                </div>
                <div className="space-y-4">
                  {Object.entries(formData.businessHours?.schedule || {}).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-24">
                          <label className="block text-sm font-medium text-gray-700 capitalize">{day}</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={hours.isOpen}
                            onChange={(e) => handleInputChange('businessHours', 'schedule', { ...formData.businessHours.schedule[day], isOpen: e.target.checked }, day)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                          />
                          <span className="text-sm text-gray-600">Open</span>
                        </div>
                      </div>
                      {hours.isOpen && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={hours.openTime}
                            onChange={(e) => handleTimeChange(day, 'openTime', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={hours.closeTime}
                            onChange={(e) => handleTimeChange(day, 'closeTime', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
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

            {activeSetting === 'tax' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <FaPoundSign className="mr-2 text-blue-600" />
                  UK Tax Settings (VAT)
                </h3>
                
                <div className="space-y-6">
                  {/* VAT Configuration */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-800 mb-3">VAT Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number</label>
                        <input
                          type="text"
                          value={formData.taxSettings?.vatNumber || ''}
                          onChange={(e) => handleInputChange('taxSettings', 'vatNumber', e.target.value)}
                          placeholder="GB123456789"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default VAT Rate</label>
                        <select
                          value={formData.taxSettings?.defaultVatRate || 'standard'}
                          onChange={(e) => handleInputChange('taxSettings', 'defaultVatRate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="standard">Standard (20%)</option>
                          <option value="reduced">Reduced (5%)</option>
                          <option value="zero">Zero (0%)</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="includeVatInPrices"
                          checked={formData.taxSettings?.includeVatInPrices || false}
                          onChange={(e) => handleInputChange('taxSettings', 'includeVatInPrices', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="includeVatInPrices" className="ml-2 block text-sm text-gray-700">
                          VAT included in displayed prices
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* VAT Rates */}
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">VAT Rates</h4>
                    <div className="space-y-4">
                      {Object.entries(formData.taxSettings?.vatRates || {}).map(([rateType, rateInfo]) => (
                        <div key={rateType} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-700 capitalize">{rateType} VAT Rate</h5>
                            <span className="text-sm text-gray-500">{rateInfo.rate}%</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Rate (%)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={rateInfo.rate}
                                onChange={(e) => handleInputChange('taxSettings', 'vatRates', { ...formData.taxSettings.vatRates[rateType], rate: parseFloat(e.target.value) }, rateType)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <input
                                type="text"
                                value={rateInfo.description}
                                onChange={(e) => handleInputChange('taxSettings', 'vatRates', { ...formData.taxSettings.vatRates[rateType], description: e.target.value }, rateType)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSetting === 'payments' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <MdPayment className="mr-2 text-blue-600" />
                  Payments & Fees (UK)
                </h3>
                
                <div className="space-y-6">
                  {/* Currency Settings */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Currency Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                          value={formData.paymentSettings?.currency || 'GBP'}
                          onChange={(e) => handleInputChange('paymentSettings', 'currency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="GBP">British Pound (GBP)</option>
                          <option value="EUR">Euro (EUR)</option>
                          <option value="USD">US Dollar (USD)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                        <input
                          type="text"
                          value={formData.paymentSettings?.currencySymbol || '£'}
                          onChange={(e) => handleInputChange('paymentSettings', 'currencySymbol', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Order Settings */}
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">Delivery & Order Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (£)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.paymentSettings?.deliveryFee || 0}
                          onChange={(e) => handleInputChange('paymentSettings', 'deliveryFee', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Threshold (£)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.paymentSettings?.freeDeliveryThreshold || 0}
                          onChange={(e) => handleInputChange('paymentSettings', 'freeDeliveryThreshold', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount (£)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.paymentSettings?.minimumOrderAmount || 0}
                          onChange={(e) => handleInputChange('paymentSettings', 'minimumOrderAmount', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Charge */}
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">Service Charge</h4>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableServiceCharge"
                          checked={formData.paymentSettings?.serviceCharge?.enabled || false}
                          onChange={(e) => handleInputChange('paymentSettings', 'serviceCharge', { ...formData.paymentSettings.serviceCharge, enabled: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="enableServiceCharge" className="ml-2 block text-sm text-gray-700">
                          Enable Service Charge
                        </label>
                      </div>
                      {formData.paymentSettings?.serviceCharge?.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge Rate (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={formData.paymentSettings?.serviceCharge?.rate || 0}
                              onChange={(e) => handleInputChange('paymentSettings', 'serviceCharge', { ...formData.paymentSettings.serviceCharge, rate: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                              type="text"
                              value={formData.paymentSettings?.serviceCharge?.description || ''}
                              onChange={(e) => handleInputChange('paymentSettings', 'serviceCharge', { ...formData.paymentSettings.serviceCharge, description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">Accepted Payment Methods</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {settingsService.getUKPaymentMethods().map((method) => (
                        <div key={method.value} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`payment-${method.value}`}
                            checked={formData.paymentSettings?.acceptedPaymentMethods?.includes(method.value) || false}
                            onChange={(e) => {
                              const currentMethods = formData.paymentSettings?.acceptedPaymentMethods || [];
                              const newMethods = e.target.checked 
                                ? [...currentMethods, method.value]
                                : currentMethods.filter(m => m !== method.value);
                              handleInputChange('paymentSettings', 'acceptedPaymentMethods', newMethods);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`payment-${method.value}`} className="ml-2 block text-sm text-gray-700">
                            {method.label}
                            {method.popular && <span className="text-xs text-blue-600 ml-1">(Popular)</span>}
                          </label>
                        </div>
                      ))}
                    </div>
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

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md shadow-sm flex items-center"
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
                
                <button
                  type="button"
                  onClick={handleResetSettings}
                  disabled={saving}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md shadow-sm flex items-center"
                >
                  <FaUndo className="mr-2" />
                  Reset to Defaults
                </button>
              </div>

              {saveStatus && (
                <div className={`flex items-center px-4 py-2 rounded-md ${
                  saveStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {saveStatus.includes('Error') ? (
                    <span className="text-red-500 mr-2">⚠</span>
                  ) : (
                    <FaCheck className="text-green-500 mr-2" />
                  )}
                  {saveStatus}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;