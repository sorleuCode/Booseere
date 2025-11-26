import api from './axios';

// Admin APIs
export const adminAPI = {
  // Get Dashboard Stats
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Export Data
  exportData: async (type) => {
    const response = await api.get(`/admin/export/${type}`, {
      responseType: 'blob'
    });
    return response;
  },

  // Get Admin Settings
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  // Update Admin Settings
  updateSettings: async (settings) => {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },

  // Get System Stats
  getSystemStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};