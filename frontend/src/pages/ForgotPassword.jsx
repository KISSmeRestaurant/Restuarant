// ForgotPassword.js
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          [method]: method === 'email' ? email : phone 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset instructions');
      }

      setSuccess(`Reset instructions sent to your ${method}`);
      if (method === 'phone') {
        navigate('/verify-code', { state: { phone } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-teal-50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-xl shadow-lg border border-teal-100"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-800 mb-2">Forgot Password</h1>
            <p className="text-teal-600">Enter your email or phone to reset your password</p>
          </div>
          
          <div className="flex mb-4">
            <button
              onClick={() => setMethod('email')}
              className={`flex-1 py-2 ${method === 'email' ? 'bg-amber-600 text-white' : 'bg-gray-200'} rounded-l-lg`}
            >
              Email
            </button>
            <button
              onClick={() => setMethod('phone')}
              className={`flex-1 py-2 ${method === 'phone' ? 'bg-amber-600 text-white' : 'bg-gray-200'} rounded-r-lg`}
            >
              Phone
            </button>
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

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg text-sm"
            >
              {success}
            </motion.div>
          )}
          
          <form onSubmit={onSubmit} className="space-y-4">
            {method === 'email' ? (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-teal-700 mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            ) : (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-teal-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="+1234567890"
                  required
                />
              </div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition disabled:opacity-70 font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : `Send Reset ${method === 'email' ? 'Link' : 'Code'}`}
            </motion.button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-teal-700">Remember your password?{' '}
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

export default ForgotPassword;