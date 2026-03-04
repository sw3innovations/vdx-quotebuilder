import React, { createContext, useState, useContext, useEffect } from 'react';

const TOKEN_KEY = 'admin_token';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin]                     = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth]     = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);
  }, []);

  const login = (token, perfil) => {
    localStorage.setItem(TOKEN_KEY, token);
    setAdmin(perfil);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isAuthenticated, isLoadingAuth, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return context;
};
