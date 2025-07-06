import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const OTPVerification = ({ email, onOTPVerified }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTime, setResendTime] = useState(60);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'OTP verification failed');

      // OTP verified successfully
      onOTPVerified();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendDisabled(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/send-otp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');

      // Start countdown
      let timeLeft = 60;
      const timer = setInterval(() => {
        timeLeft -= 1;
        setResendTime(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(timer);
          setResendDisabled(false);
          setResendTime(60);
        }
      }, 1000);
    } catch (err) {
      setError(err.message);
      setResendDisabled(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg"
    >
      <h2 className="text-2xl font-bold text-center text-teal-800">Verify OTP</h2>
      <p className="text-sm text-center text-teal-600 mt-1 mb-6">
        We've sent a 6-digit code to {email}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-teal-700 mb-1">OTP Code</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            required
            className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 text-white py-2 rounded-lg font-medium hover:bg-amber-700 transition disabled:opacity-70"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-teal-700">
        <p>
          Didn't receive code?{' '}
          <button
            onClick={handleResendOTP}
            disabled={resendDisabled}
            className={`text-amber-600 hover:text-amber-800 font-medium ${resendDisabled ? 'opacity-50' : ''}`}
          >
            {resendDisabled ? `Resend in ${resendTime}s` : 'Resend OTP'}
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default OTPVerification;