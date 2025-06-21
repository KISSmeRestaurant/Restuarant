import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';

const countryCodes = [
  { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
  { name: 'United States', code: 'US', dialCode: '+1' },
  { name: 'Canada', code: 'CA', dialCode: '+1' },
  { name: 'Australia', code: 'AU', dialCode: '+61' },
  { name: 'Germany', code: 'DE', dialCode: '+49' },
  { name: 'France', code: 'FR', dialCode: '+33' },
  { name: 'India', code: 'IN', dialCode: '+91' },
  // Add more countries as needed
];

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    countryCode: '+44' // Default to UK
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { firstName, lastName, email, password, confirmPassword, phone, countryCode } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const onCountryChange = e => {
    setFormData({ ...formData, countryCode: e.target.value });
  };

  const validateForm = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (!consentGiven) {
      setError('You must accept the terms and conditions');
      return false;
    }
    
    if (phone) {
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length < 6 || digitsOnly.length > 15) {
        setError('Please provide a valid phone number');
        return false;
      }
    }

    return true;
  };

const onSubmit = async e => {
  e.preventDefault();
  setError('');

  if (!validateForm()) return;

  setLoading(true);
  
  try {
    const fullPhone = countryCode + phone.replace(/\D/g, '');
    
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        firstName,
        lastName,
        email, 
        password,
        passwordConfirm: confirmPassword,
        phone: fullPhone,
        termsAccepted: consentGiven,
        marketingOptIn: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    // Dispatch the auth-change event before navigation
    window.dispatchEvent(new Event('auth-change'));
    navigate('/dashboard');
  } catch (err) {
    setError(err.message || 'Signup failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-xl shadow-lg border border-teal-100"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-800 mb-2">Create Account</h1>
            <p className="text-teal-600">Join our community today</p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-teal-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="firstName" 
                  value={firstName}
                  onChange={onChange}
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-teal-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="lastName" 
                  value={lastName}
                  onChange={onChange}
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-teal-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={onChange}
                className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-teal-700 mb-1">
                Phone
              </label>
              <div className="flex">
                <select
                  value={countryCode}
                  onChange={onCountryChange}
                  className="w-1/3 px-2 py-2 border border-teal-200 rounded-l-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  {countryCodes.map(country => (
                    <option key={country.code} value={country.dialCode}>
                      {country.dialCode} {country.code}
                    </option>
                  ))}
                </select>
                <input 
                  type="tel" 
                  id="phone" 
                  value={phone}
                  onChange={onChange}
                  placeholder="Enter phone number without country code"
                  className="w-2/3 px-4 py-2 border-t border-b border-r border-teal-200 rounded-r-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-teal-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  value={password}
                  onChange={onChange}
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-teal-600 hover:text-teal-800"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-teal-600 mt-1">Password must be at least 6 characters</p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-teal-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input 
                type={showPassword ? "text" : "password"} 
                id="confirmPassword" 
                value={confirmPassword}
                onChange={onChange}
                className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>

            <div className="flex items-start mt-4">
              <div className="flex items-center h-5">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="w-4 h-4 text-amber-600 border-teal-300 rounded focus:ring-amber-500"
                  required
                />
              </div>
              <label htmlFor="consent" className="ml-2 block text-sm text-teal-700">
                I agree to the{' '}
                <Link to="/terms" className="text-amber-600 hover:underline">
                  Terms and Conditions
                </Link>{' '}
                <span className="text-red-500">*</span>
              </label>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-4 rounded-lg hover:from-amber-600 hover:to-amber-700 transition disabled:opacity-70 font-medium shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : 'Sign Up'}
            </motion.button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-teal-700">Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-amber-600 hover:text-amber-800 font-medium"
              >
                Log In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Signup;