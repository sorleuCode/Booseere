import api from './axios';
import { handleApiError } from '../utils/errorHandler';

// Auth APIs
export const authAPI = {
  // Register Admin
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register-admin', userData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Registration failed. Please try again.');
      throw error;
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Login failed. Please try again.');
      throw error;
    }
  },

  // Get Profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch profile data.');
      throw error;
    }
  },

  // Update Profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update profile.');
      throw error;
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to send password reset email.');
      throw error;
    }
  },

  // Reset Password
  resetPassword: async (token, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Password reset failed.');
      throw error;
    }
  },

  // Change Password
  changePassword: async (passwords) => {
    try {
      const response = await api.put('/auth/change-password', passwords);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to change password.');
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Logout failed.', 'warning');
      throw error;
    }
  },
};