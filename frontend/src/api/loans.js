import api from './axios';

// Loan APIs
export const loanAPI = {
  // Get All Loans
  getAll: async () => {
    const response = await api.get('/loans');
    return response.data;
  },

  // Apply for Loan
  apply: async (loanData) => {
    const response = await api.post('/loans', loanData);
    return response.data;
  },

  // Update Loan
  update: async (id, loanData) => {
    const response = await api.put(`/loans/${id}`, loanData);
    return response.data;
  },

  // Delete Loan
  delete: async (id) => {
    const response = await api.delete(`/loans/${id}`);
    return response.data;
  },

  // Approve Loan
  approve: async (id) => {
    const response = await api.put(`/loans/${id}/approve`);
    return response.data;
  },

  // Reject Loan
  reject: async (id, reason) => {
    const response = await api.put(`/loans/${id}/reject`, { reason });
    return response.data;
  },

  // Record Loan Payment
  recordPayment: async (id, paymentData) => {
    const response = await api.post(`/loans/${id}/payment`, paymentData);
    return response.data;
  },

  // Get Loans by Member
  getByMember: async (memberId) => {
    const response = await api.get(`/loans/member/${memberId}`);
    return response.data;
  },
};