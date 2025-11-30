import api from './axios';

// Members API
export const memberAPI = {
  // Get all members
  getAll: async () => {
    const response = await api.get('/members');
    return response.data;
  },

  // Get member by ID
  getById: async (id) => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },

  // Add a new member
  create: async (memberData) => {
    const response = await api.post('/members', memberData);
    return response.data;
  },

  // Update a member
  update: async (id, memberData) => {
    const response = await api.put(`/members/${id}`, memberData);
    return response.data;
  },

  // Get public members (no authentication)
  getPublicMembers: async (params = {}) => {
    const response = await api.get('/members/public', { params });
    return response.data;
  },

  // Delete a member
  delete: async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  },

  // Get member statistics
  getStats: async () => {
    const response = await api.get('/members/stats');
    return response.data;
  },

  // Get member statistics by ID
  getStatsById: async (id) => {
    const response = await api.get(`/members/${id}/stats`);
    return response.data;
  },
};

// Backward compatibility exports
export const getMembers = memberAPI.getAll;
export const addMember = memberAPI.create;
export const updateMember = memberAPI.update;
export const deleteMember = memberAPI.delete;
export const getPublicMembers = memberAPI.getPublicMembers;