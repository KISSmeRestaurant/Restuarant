import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import OTPVerification from './OTPVerification';
import ResetPasswordForm from './ResetPasswordForm';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('method'); // 'method', 'email', 'phone', 'otp', 'reset'
  const [verificationMethod, setVerificationMethod] = useState(''); // 'email' or 'phone'

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = verificationMethod === 'email' 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/auth/send-otp`
        : `${import.meta.env.VITE_API_BASE_URL}/api/auth/send-phone-otp`;

      const body = verificationMethod === 'email' 
        ? JSON.stringify({ email }) 
        : JSON.stringify({ phone });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(errorText || 'Failed to send OTP');
      }

      const data = await response.json();
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
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
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-amber-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 'method' && (
            <motion.div
              key="method"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h2 className="text-2xl font-bold text-center text-teal-800">Forgot Password</h2>
              <p className="text-sm text-center text-teal-600 mt-1 mb-6">
                Choose how you'd like to reset your password
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setVerificationMethod('email');
                    setStep('email');
                  }}
                  className="w-full flex items-center justify-center p-4 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3 group-hover:bg-teal-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-teal-800">Email Verification</h3>
                    <p className="text-xs text-teal-600">We'll send a code to your email</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    setVerificationMethod('phone');
                    setStep('phone');
                  }}
                  className="w-full flex items-center justify-center p-4 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3 group-hover:bg-amber-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-amber-800">Phone Verification</h3>
                    <p className="text-xs text-amber-600">We'll send a code via SMS</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-teal-700">
                Remember your password?{' '}
                <Link to="/login" className="text-amber-600 hover:text-amber-800 font-medium">
                  Log In
                </Link>
              </p>
            </motion.div>
          )}

          {(step === 'email' || step === 'phone') && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <button 
                onClick={() => setStep('method')}
                className="flex items-center text-teal-600 hover:text-teal-800 mb-4 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>

              <h2 className="text-2xl font-bold text-center text-teal-800">Forgot Password</h2>
              <p className="text-sm text-center text-teal-600 mt-1 mb-6">
                {verificationMethod === 'email' 
                  ? 'Enter your email to receive a verification code' 
                  : 'Enter your phone number to receive an SMS code'}
              </p>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-1">
                    {verificationMethod === 'email' ? 'Email' : 'Phone Number'}
                  </label>
                  {verificationMethod === 'email' ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">+1</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="555-123-4567"
                        required
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                        className="w-full pl-10 px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition disabled:opacity-70"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    `Send ${verificationMethod === 'email' ? 'Email' : 'SMS'} Code`
                  )}
                </motion.button>
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
            <OTPVerification 
              email={email} 
              phone={phone}
              verificationMethod={verificationMethod}
              onOTPVerified={handleOTPVerified} 
              onBack={() => setStep(verificationMethod)} 
            />
          )}

          {step === 'reset' && (
            <ResetPasswordForm 
              email={email} 
              phone={phone}
              verificationMethod={verificationMethod}
              onSuccess={handlePasswordReset} 
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;