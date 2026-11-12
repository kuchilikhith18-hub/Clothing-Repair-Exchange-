import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { registerUser, loginUser, getMe, updateMe } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await getMe();
      setUser(res.data.data || res.data.user || res.data);
      setError(null);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await loginUser({ email, password });
      const data = res.data;
      const token = data.token || data.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      const userData = data.user || data.data?.user || data.data;
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message =
        err.response?.data?.errors?.map((e) => e.message).join(', ') ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (formData) => {
    try {
      setError(null);
      const res = await registerUser(formData);
      const data = res.data;
      const token = data.token || data.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      const userData = data.user || data.data?.user || data.data;
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message =
        err.response?.data?.errors?.map((e) => e.message).join(', ') ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const updateProfile = async (data) => {
    try {
      setError(null);
      const res = await updateMe(data);
      const userData = res.data.data || res.data.user || res.data;
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message =
        err.response?.data?.errors?.map((e) => e.message).join(', ') ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Profile update failed.';
      setError(message);
      return { success: false, error: message };
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    loadUser,
    clearError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
