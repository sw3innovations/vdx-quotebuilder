import React, { createContext, useState, useContext, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:9090';
const TOKEN_KEY = 'vidraceiro_token';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]                       = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth]     = useState(true);

  useEffect(() => { checkAppState(); }, []);

  const checkAppState = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setIsLoadingAuth(false); return; }
    await checkUserAuth(token);
  };

  const checkUserAuth = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/api/vidraceiro/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setUser(await response.json());
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    await checkUserAuth(token);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
