import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import OTPVerification from './OTPVerification';
import ResetPasswordForm from './ResetPasswordForm';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset'

const handleSendOTP = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(errorText || 'Failed to send OTP');
    }

    const data = await response.json();
    setStep('otp');
  } catch (err) {
    setError(err.message);
    console.error('Full error:', err);
  } finally {
    setLoading(false);
  }
};
  const handleOTPVerified = () => {
    setStep('reset');
  };

  const handlePasswordReset = () => {
    // Redirect to login or show success message
    alert('Password reset successfully! You can now login with your new password.');
    // You might want to redirect to login here
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-teal-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full max-w-md">
        {step === 'email' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h2 className="text-2xl font-bold text-center text-teal-800">Forgot Password</h2>
            <p className="text-sm text-center text-teal-600 mt-1 mb-6">
              Enter your email to receive a verification code
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 text-white py-2 rounded-lg font-medium hover:bg-amber-700 transition disabled:opacity-70"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-teal-700">
              Remember your password?{' '}
              <Link to="/login" className="text-amber-600 hover:text-amber-800 font-medium">
                Log In
              </Link>
            </p>
          </motion.div>
        )}

        {step === 'otp' && (
          <OTPVerification email={email} onOTPVerified={handleOTPVerified} />
        )}

        {step === 'reset' && (
          <ResetPasswordForm email={email} onSuccess={handlePasswordReset} />
        )}
      </div>
    </motion.div>
  );
};

export default ForgotPassword;