import api from './axios';
import { handleApiError } from '../utils/errorHandler';

// Contribution APIs
export const contributionAPI = {
  // Get All Contributions
  getAll: async () => {
    try {
      const response = await api.get('/contributions');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch contributions.');
      throw error;
    }
  },

  // Get Single Contribution
  getById: async (id) => {
    try {
      const response = await api.get(`/contributions/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch contribution details.');
      throw error;
    }
  },

  // Add Contribution
  add: async (contributionData) => {
    try {
      const response = await api.post('/contributions', contributionData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to add contribution.');
      throw error;
    }
  },

  // Update Contribution
  update: async (id, contributionData) => {
    try {
      const response = await api.put(`/contributions/${id}`, contributionData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update contribution.');
      throw error;
    }
  },

  // Delete Contribution
  delete: async (id) => {
    try {
      const response = await api.delete(`/contributions/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete contribution.');
      throw error;
    }
  },

  // Get Contributions by Member
  getByMember: async (memberId) => {
    try {
      const response = await api.get(`/contributions/member/${memberId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch member contributions.');
      throw error;
    }
  },
};