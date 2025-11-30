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

  // Get Recent Activities
  getActivities: async () => {
    const response = await api.get('/admin/activities');
    return response.data;
  },

  // Get Financial Report
  getFinancialReport: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/admin/financial-report', { params });
    return response.data;
  },

  // Admin Notes Management
  getNotes: async () => {
    const response = await api.get('/admin/notes');
    return response.data;
  },

  addNote: async (content) => {
    const response = await api.post('/admin/notes', { content });
    return response.data;
  },

  updateNote: async (noteId, content) => {
    const response = await api.put(`/admin/notes/${noteId}`, { content });
    return response.data;
  },

  deleteNote: async (noteId) => {
    const response = await api.delete(`/admin/notes/${noteId}`);
    return response.data;
  },

  // Create Admin User
  createAdmin: async (adminData) => {
    const response = await api.post('/admin/create-admin', adminData);
    return response.data;
  },

  // Get Chart Data
  getChartData: async () => {
    const response = await api.get('/admin/chart-data');
    return response.data;
  },

  // Contact Management
  getContacts: async (params = {}) => {
    const response = await api.get('/admin/contacts', { params });
    return response.data;
  },

  getContact: async (id) => {
    const response = await api.get(`/admin/contacts/${id}`);
    return response.data;
  },

  updateContactStatus: async (id, status) => {
    const response = await api.put(`/admin/contacts/${id}`, { status });
    return response.data;
  },

  deleteContact: async (id) => {
    const response = await api.delete(`/admin/contacts/${id}`);
    return response.data;
  },

  getContactStats: async () => {
    const response = await api.get('/admin/contacts/stats');
    return response.data;
  },
};