import { account } from '../config/appwrite.js';
import { OAuthProvider } from 'appwrite';

class AppwriteAuthService {
  // Google OAuth login
  async loginWithGoogle() {
    try {
      // Create OAuth2 session with Google
      const response = await account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/auth/callback`, // Success redirect
        `${window.location.origin}/login?error=oauth_failed` // Failure redirect
      );
      return response;
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  }

  // Get current user from Appwrite
  async getCurrentUser() {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Sync Appwrite user with your backend
  async syncWithBackend(appwriteUser) {
    try {
      const apiUrl = import.meta.env.DEV 
        ? '/api/auth/appwrite-sync' 
        : 'https://restuarant-sh57.onrender.com/api/auth/appwrite-sync';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appwriteId: appwriteUser.$id,
          email: appwriteUser.email,
          name: appwriteUser.name,
          emailVerification: appwriteUser.emailVerification
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Backend sync failed');
      }

      return data;
    } catch (error) {
      console.error('Backend sync error:', error);
      throw error;
    }
  }

  // Complete OAuth flow
  async completeOAuthFlow() {
    try {
      // Get user from Appwrite
      const appwriteUser = await this.getCurrentUser();
      
      if (!appwriteUser) {
        throw new Error('No user found in Appwrite session');
      }

      // Sync with backend to get JWT token and user data
      const backendResponse = await this.syncWithBackend(appwriteUser);

      // Store backend auth data
      localStorage.setItem('token', backendResponse.token);
      localStorage.setItem('user', JSON.stringify(backendResponse.data.user));
      
      // Dispatch auth change event
      window.dispatchEvent(new Event('auth-change'));

      return backendResponse.data.user;
    } catch (error) {
      console.error('OAuth flow completion error:', error);
      throw error;
    }
  }

  // Logout from both Appwrite and backend
  async logout() {
    try {
      // Logout from Appwrite
      await account.deleteSession('current');
    } catch (error) {
      console.error('Appwrite logout error:', error);
    }

    try {
      // Logout from backend
      const apiUrl = import.meta.env.DEV 
        ? '/api/auth/logout' 
        : 'https://restuarant-sh57.onrender.com/api/auth/logout';

      await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Backend logout error:', error);
    }

    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Dispatch auth change event
    window.dispatchEvent(new Event('auth-change'));
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
}

export default new AppwriteAuthService();
