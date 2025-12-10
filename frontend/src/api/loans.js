import api from './axios';
import { handleApiError } from '../utils/errorHandler';

// Loan APIs
export const loanAPI = {
  // Get All Loans
  getAll: async () => {
    try {
      const response = await api.get('/loans');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch loans.');
      throw error;
    }
  },

  // Apply for Loan
  apply: async (loanData) => {
    try {
      const response = await api.post('/loans', loanData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to apply for loan.');
      throw error;
    }
  },

  // Update Loan
  update: async (id, loanData) => {
    try {
      const response = await api.put(`/loans/${id}`, loanData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update loan.');
      throw error;
    }
  },

  // Delete Loan
  delete: async (id) => {
    try {
      const response = await api.delete(`/loans/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete loan.');
      throw error;
    }
  },

  // Approve Loan
  approve: async (id) => {
    try {
      const response = await api.put(`/loans/${id}/approve`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to approve loan.');
      throw error;
    }
  },

  // Reject Loan
  reject: async (id, reason) => {
    try {
      const response = await api.put(`/loans/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to reject loan.');
      throw error;
    }
  },

  // Disburse Loan
  disburse: async (id) => {
    try {
      const response = await api.put(`/loans/${id}/disburse`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to disburse loan.');
      throw error;
    }
  },

  // Record Loan Payment
  recordPayment: async (id, paymentData) => {
    try {
      const response = await api.post(`/loans/${id}/repayment`, paymentData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to record loan payment.');
      throw error;
    }
  },

  // Get Loans by Member
  getByMember: async (memberId) => {
    try {
      const response = await api.get(`/loans/member/${memberId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch member loans.');
      throw error;
    }
  },

  // Get Single Loan
  getById: async (id) => {
    try {
      const response = await api.get(`/loans/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch loan details.');
      throw error;
    }
  },
};