import React, { createContext, useState, useContext, useEffect } from 'react';
import { appParams } from '@/lib/app-params';

const AuthContext = createContext();

// Token mockado para desenvolvimento
const MOCK_TOKEN = 'mock_admin_token_12345';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // Usar token da URL/localStorage ou token mockado
      const token = appParams.token || MOCK_TOKEN;
      
      // Salvar token mockado no localStorage se não houver token
      if (!appParams.token && !localStorage.getItem('app_access_token') && !localStorage.getItem('token')) {
        localStorage.setItem('app_access_token', MOCK_TOKEN);
      }
      
      // Check if user is authenticated
      if (token) {
        await checkUserAuth(token);
      } else {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
      }
      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async (token) => {
    try {
      // Check if user is authenticated based on token
      setIsLoadingAuth(true);
      // TODO: Implement your own authentication check here
      // For now, if token exists, consider user authenticated
      if (token) {
        setUser({ token: token });
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      
      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Remove token from storage
    localStorage.removeItem('app_access_token');
    localStorage.removeItem('token');
    
    if (shouldRedirect) {
      window.location.href = window.location.href;
    }
  };

  const navigateToLogin = () => {
    // TODO: Implement your own login redirect
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
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
