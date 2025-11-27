import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/auth';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on mount and verify with API
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (token && userData) {
      // Verify token with API and get fresh user data
      verifyTokenAndLoadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyTokenAndLoadUser = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        // Update localStorage with fresh data
        localStorage.setItem('adminUser', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear invalid token but don't redirect - let user navigate freely
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.success) {
        // Extract user data and token from response
        const { token, ...userData } = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  // Update user data via API
  const updateUser = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('adminUser', JSON.stringify(response.data));
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  // Change password
  const changePassword = async (passwords) => {
    try {
      const response = await authAPI.changePassword(passwords);
      if (response.success) {
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Password change failed:', error);
      return { success: false, message: error.response?.data?.message || 'Password change failed' };
    }
  };

  // Refresh user data from API
  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('adminUser', JSON.stringify(response.data));
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('User refresh failed:', error);
      return { success: false, message: 'Failed to refresh user data' };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    changePassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};