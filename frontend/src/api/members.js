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

  // Delete a member
  delete: async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  },

  // Add loan record for a member
  addLoanRecord: async (memberId, loanData) => {
    const response = await api.post(`/members/${memberId}/loans`, loanData);
    return response.data;
  },
};

// Backward compatibility exports
export const getMembers = memberAPI.getAll;
export const addMember = memberAPI.create;
export const updateMember = memberAPI.update;
export const deleteMember = memberAPI.delete;
export const addLoanRecord = memberAPI.addLoanRecord;