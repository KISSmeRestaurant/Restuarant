import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import appwriteAuthService from '../services/appwriteAuth';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          navigate('/login?error=oauth_failed', { replace: true });
          return;
        }

        // Complete the OAuth flow with Appwrite
        const user = await appwriteAuthService.completeOAuthFlow();
        
        if (user) {
          // Determine redirect path based on user role
          const redirectPath = user.role === 'admin' 
            ? '/admin/dashboard' 
            : user.role === 'staff' 
            ? '/staff/dashboard' 
            : '/';
          
          navigate(redirectPath, { replace: true });
        } else {
          throw new Error('Failed to complete OAuth flow');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=callback_failed', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Completing Sign In...</h2>
        <p className="text-gray-500">Please wait while we finish setting up your account.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
