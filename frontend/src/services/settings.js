import API_CONFIG from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

class SettingsService {
  // Get authentication token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Create headers with authentication
  getHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Handle API response
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Get all settings
  async getSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  // Update general settings
  async updateSettings(settingsData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(settingsData)
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  // Update restaurant information
  async updateRestaurantInfo(restaurantData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/restaurant`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(restaurantData)
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating restaurant info:', error);
      throw error;
    }
  }

  // Update business hours
  async updateBusinessHours(businessHoursData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/business-hours`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(businessHoursData)
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating business hours:', error);
      throw error;
    }
  }

  // Update tax settings
  async updateTaxSettings(taxData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/tax`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(taxData)
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating tax settings:', error);
      throw error;
    }
  }

  // Update payment settings
  async updatePaymentSettings(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/payment`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(paymentData)
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating payment settings:', error);
      throw error;
    }
  }

  // Calculate order totals
  async calculateOrderTotals(orderData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/calculate-totals`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderData)
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error calculating order totals:', error);
      throw error;
    }
  }

  // Reset settings to default
  async resetSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/reset`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }

  // Utility methods for UK tax calculations
  calculateUKVAT(amount, vatRate = 20, includeVAT = true) {
    if (includeVAT) {
      // VAT is included in the price
      const vatAmount = (amount * vatRate) / (100 + vatRate);
      return {
        netAmount: amount - vatAmount,
        vatAmount: vatAmount,
        grossAmount: amount,
        vatRate: vatRate
      };
    } else {
      // VAT is added to the price
      const vatAmount = (amount * vatRate) / 100;
      return {
        netAmount: amount,
        vatAmount: vatAmount,
        grossAmount: amount + vatAmount,
        vatRate: vatRate
      };
    }
  }

  // Format currency for UK
  formatCurrency(amount, currency = 'GBP', locale = 'en-GB') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Validate UK postcode
  validateUKPostcode(postcode) {
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    return ukPostcodeRegex.test(postcode.replace(/\s/g, ''));
  }

  // Validate UK phone number
  validateUKPhone(phone) {
    const ukPhoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$|^(\+44\s?[1-9]\d{2,4}|\(?0[1-9]\d{2,4}\)?)\s?\d{3,6}$/;
    return ukPhoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Get UK VAT rates
  getUKVATRates() {
    return {
      standard: {
        rate: 20,
        description: 'Standard VAT rate for most items'
      },
      reduced: {
        rate: 5,
        description: 'Reduced VAT rate for certain food items'
      },
      zero: {
        rate: 0,
        description: 'Zero VAT rate for basic food items'
      }
    };
  }

  // Get UK business hours template
  getUKBusinessHoursTemplate() {
    return {
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
    };
  }

  // Get UK payment methods
  getUKPaymentMethods() {
    return [
      { value: 'card', label: 'Credit/Debit Card', popular: true },
      { value: 'cash', label: 'Cash on Delivery', popular: true },
      { value: 'paypal', label: 'PayPal', popular: false },
      { value: 'apple_pay', label: 'Apple Pay', popular: true },
      { value: 'google_pay', label: 'Google Pay', popular: true }
    ];
  }
}

export default new SettingsService();
