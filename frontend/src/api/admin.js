import api from './axios';
import { handleApiError } from '../utils/errorHandler';

// Admin APIs
export const adminAPI = {
  // Get Dashboard Stats
  getDashboard: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch dashboard data.');
      throw error;
    }
  },

  // Export Data
  exportData: async (type) => {
    try {
      const response = await api.get(`/admin/export/${type}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to export data.');
      throw error;
    }
  },

  // Get Admin Settings
  getSettings: async () => {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch admin settings.');
      throw error;
    }
  },

  // Update Admin Settings
  updateSettings: async (settings) => {
    try {
      const response = await api.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update admin settings.');
      throw error;
    }
  },

  // Get System Stats
  getSystemStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch system statistics.');
      throw error;
    }
  },

  // Get Recent Activities
  getActivities: async () => {
    try {
      const response = await api.get('/admin/activities');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch recent activities.');
      throw error;
    }
  },

  // Get Financial Report
  getFinancialReport: async (startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/admin/financial-report', { params });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to generate financial report.');
      throw error;
    }
  },

  // Admin Notes Management
  getNotes: async () => {
    try {
      const response = await api.get('/admin/notes');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch admin notes.');
      throw error;
    }
  },

  addNote: async (content) => {
    try {
      const response = await api.post('/admin/notes', { content });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to add admin note.');
      throw error;
    }
  },

  updateNote: async (noteId, content) => {
    try {
      const response = await api.put(`/admin/notes/${noteId}`, { content });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update admin note.');
      throw error;
    }
  },

  deleteNote: async (noteId) => {
    try {
      const response = await api.delete(`/admin/notes/${noteId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete admin note.');
      throw error;
    }
  },

  // Create Admin User
  createAdmin: async (adminData) => {
    try {
      const response = await api.post('/admin/create-admin', adminData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create admin user.');
      throw error;
    }
  },

  // Get Chart Data
  getChartData: async () => {
    try {
      const response = await api.get('/admin/chart-data');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch chart data.');
      throw error;
    }
  },

  // Contact Management
  getContacts: async (params = {}) => {
    try {
      const response = await api.get('/admin/contacts', { params });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch contacts.');
      throw error;
    }
  },

  getContact: async (id) => {
    try {
      const response = await api.get(`/admin/contacts/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch contact details.');
      throw error;
    }
  },

  updateContactStatus: async (id, status) => {
    try {
      const response = await api.put(`/admin/contacts/${id}`, { status });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update contact status.');
      throw error;
    }
  },

  deleteContact: async (id) => {
    try {
      const response = await api.delete(`/admin/contacts/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete contact.');
      throw error;
    }
  },

  getContactStats: async () => {
    try {
      const response = await api.get('/admin/contacts/stats');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch contact statistics.');
      throw error;
    }
  },
};