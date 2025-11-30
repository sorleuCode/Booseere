import api from './axios';

// Contribution APIs
export const contributionAPI = {
  // Get All Contributions
  getAll: async () => {
    const response = await api.get('/contributions');
    return response.data;
  },

  // Get Single Contribution
  getById: async (id) => {
    const response = await api.get(`/contributions/${id}`);
    return response.data;
  },

  // Add Contribution
  add: async (contributionData) => {
    const response = await api.post('/contributions', contributionData);
    return response.data;
  },

  // Update Contribution
  update: async (id, contributionData) => {
    const response = await api.put(`/contributions/${id}`, contributionData);
    return response.data;
  },

  // Delete Contribution
  delete: async (id) => {
    const response = await api.delete(`/contributions/${id}`);
    return response.data;
  },

  // Get Contributions by Member
  getByMember: async (memberId) => {
    const response = await api.get(`/contributions/member/${memberId}`);
    return response.data;
  },
};