import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // Fetch public settings WITHOUT token — this is a public endpoint.
      // Sending an expired token here causes a 403 auth_required that
      // wrongly redirects the user to login even on public pages.
      const appClient = createAxiosClient({
        baseURL: `/api/apps/public`,
        headers: {
          'X-App-Id': appParams.appId
        },
        token: null,
        interceptResponses: true
      });
      
      try {
        const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
        setAppPublicSettings(publicSettings);
        setIsLoadingPublicSettings(false);
        
        // Now check if the user has a stored token and try to validate it
        const storedToken = appParams.token || localStorage.getItem('base44_access_token') || localStorage.getItem('token');
        if (storedToken) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
      } catch (appError) {
        console.error('App state check failed:', appError);
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
        setAuthChecked(true);
        
        // Only treat user_not_registered as a hard error — auth_required
        // on public settings means the token is expired; we just clear it
        // and let the user browse public pages without forcing a redirect.
        if (appError.status === 403 && appError.data?.extra_data?.reason === 'user_not_registered') {
          setAuthError({
            type: 'user_not_registered',
            message: 'User not registered for this app'
          });
        } else {
          // For any other error, mark as not authenticated but don't block the app
          setIsAuthenticated(false);
          clearStoredTokens();
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      setIsAuthenticated(false);
    }
  };

  const clearStoredTokens = () => {
    try {
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('base44_token');
    } catch { /* ignore */ }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      // Track last login for campaign audience filtering (active/inactive)
      try { await base44.auth.updateMe({ last_login: new Date().toISOString() }); } catch { /* non-critical */ }
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);
      
      // Token is expired or invalid — clear it so the user isn't stuck
      // in a loop of failed auth checks on every page load.
      if (error.status === 401 || error.status === 403) {
        clearStoredTokens();
        // Don't set authError — let the user browse public pages.
        // ProtectedRoute will redirect to /login only when they try
        // to access a protected page.
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};