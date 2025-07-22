import { createContext, useContext, useState, useEffect } from 'react';
import settingsService from '../services/settings';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load settings from API
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is admin before trying to load admin settings
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      if (!token || userRole !== 'admin') {
        // Use default settings for non-admin users
        const defaultSettings = {
          restaurantInfo: {
            name: 'Restaurant',
            email: 'info@restaurant.com',
            phone: '+44 20 1234 5678'
          },
          taxSettings: {
            vatRates: {
              standard: { rate: 20 },
              reduced: { rate: 5 },
              zero: { rate: 0 }
            },
            defaultVatRate: 'standard',
            includeVatInPrices: true
          },
          paymentSettings: {
            currency: 'GBP',
            currencySymbol: '£',
            deliveryFee: 3.99,
            freeDeliveryThreshold: 25.00
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
          }
        };
        setSettings(defaultSettings);
        setLoading(false);
        return;
      }
      
      const response = await settingsService.getSettings();
      if (response.status === 'success') {
        setSettings(response.data);
        // Store in localStorage for offline access
        localStorage.setItem('appSettings', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      
      // If it's an authentication error, use default settings
      if (error.message.includes('not logged in') || error.message.includes('Unauthorized')) {
        const defaultSettings = {
          restaurantInfo: {
            name: 'Restaurant',
            email: 'info@restaurant.com',
            phone: '+44 20 1234 5678'
          },
          taxSettings: {
            vatRates: {
              standard: { rate: 20 },
              reduced: { rate: 5 },
              zero: { rate: 0 }
            },
            defaultVatRate: 'standard',
            includeVatInPrices: true
          },
          paymentSettings: {
            currency: 'GBP',
            currencySymbol: '£',
            deliveryFee: 3.99,
            freeDeliveryThreshold: 25.00
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
          }
        };
        setSettings(defaultSettings);
        setError(null); // Clear error for non-admin users
      } else {
        setError(error.message);
        // Try to load from localStorage as fallback
        const cachedSettings = localStorage.getItem('appSettings');
        if (cachedSettings) {
          try {
            setSettings(JSON.parse(cachedSettings));
          } catch (parseError) {
            console.error('Error parsing cached settings:', parseError);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Update settings and refresh context
  const updateSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      // Broadcast settings change to other components
      window.dispatchEvent(new CustomEvent('settings-updated', { detail: newSettings }));
    } catch (error) {
      console.error('Error updating settings context:', error);
    }
  };

  // Get specific setting value with fallback
  const getSetting = (path, fallback = null) => {
    if (!settings) return fallback;
    
    const keys = path.split('.');
    let value = settings;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return fallback;
      }
    }
    
    return value;
  };

  // Calculate VAT for orders
  const calculateVAT = (amount, vatType = null) => {
    const vatRates = getSetting('taxSettings.vatRates', {});
    const defaultVatRate = getSetting('taxSettings.defaultVatRate', 'standard');
    const includeVatInPrices = getSetting('taxSettings.includeVatInPrices', true);
    
    const rateType = vatType || defaultVatRate;
    const vatRate = vatRates[rateType]?.rate || 20;
    
    return settingsService.calculateUKVAT(amount, vatRate, includeVatInPrices);
  };

  // Format currency based on settings
  const formatCurrency = (amount) => {
    const currency = getSetting('paymentSettings.currency', 'GBP');
    const currencySymbol = getSetting('paymentSettings.currencySymbol', '£');
    
    if (currencySymbol) {
      return `${currencySymbol}${amount.toFixed(2)}`;
    }
    
    return settingsService.formatCurrency(amount, currency);
  };

  // Get delivery fee with free delivery threshold
  const getDeliveryFee = (orderTotal) => {
    const deliveryFee = getSetting('paymentSettings.deliveryFee', 3.99);
    const freeDeliveryThreshold = getSetting('paymentSettings.freeDeliveryThreshold', 25.00);
    
    return orderTotal >= freeDeliveryThreshold ? 0 : deliveryFee;
  };

  // Check if restaurant is open
  const isRestaurantOpen = () => {
    const schedule = getSetting('businessHours.schedule', {});
    const timezone = getSetting('businessHours.timezone', 'Europe/London');
    
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toLocaleTimeString('en-GB', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: timezone 
    });
    
    const todaySchedule = schedule[dayName];
    if (!todaySchedule || !todaySchedule.isOpen) {
      return false;
    }
    
    return currentTime >= todaySchedule.openTime && currentTime <= todaySchedule.closeTime;
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    
    // Listen for settings updates from other tabs/components
    const handleSettingsUpdate = (event) => {
      if (event.detail) {
        setSettings(event.detail);
      }
    };
    
    window.addEventListener('settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, []);

  const value = {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings,
    getSetting,
    calculateVAT,
    formatCurrency,
    getDeliveryFee,
    isRestaurantOpen
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
