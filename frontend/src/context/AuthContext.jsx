import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session via /auth/me
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      setLoading(true);
      const res = await apiClient.get('/auth/me');
      if (res.success && res.data.user) {
        setUser(res.data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.success && res.data.user) {
      setUser(res.data.user);
      return res.data.user;
    }
  }

  async function register(name, email, password) {
    const res = await apiClient.post('/auth/register', { name, email, password });
    if (res.success && res.data.user) {
      setUser(res.data.user);
      return res.data.user;
    }
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API failed:', err);
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
