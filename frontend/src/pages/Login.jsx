import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
   const navigate = useNavigate();


  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

const onSubmit = async e => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (!data.token || !data.data?.user) {
      throw new Error('Invalid response from server');
    }

    // Clear any existing auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Set new auth data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    // Trigger auth change event
    window.dispatchEvent(new Event('auth-change'));
    
    // Redirect based on role
    const role = data.data.user.role || 'user';
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'staff') {
      navigate('/staff/dashboard');
    } else {
      navigate('/dashboard');
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
            <h1 className="text-3xl font-bold text-teal-800 mb-2">Welcome Back</h1>
            <p className="text-teal-600">Login to your account</p>
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
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-teal-700 mb-1">Email</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={onChange}
                className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="your@email.com"
                required
              />
            </div>
            
             <div>
      <label htmlFor="password" className="block text-sm font-medium text-teal-700 mb-1">Password</label>
      <div className="relative">
        <input 
          type={showPassword ? "text" : "password"} 
          id="password" 
          value={password}
          onChange={onChange}
          className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-10"
          placeholder="••••••••"
          required
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </div>

            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-amber-600 hover:text-amber-800"
              >
                Forgot password?
              </Link>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition disabled:opacity-70 font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </motion.button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-teal-700">Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-amber-600 hover:text-amber-800 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;