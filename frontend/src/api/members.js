import api from './axios';
import { handleApiError } from '../utils/errorHandler';

// Members API
export const memberAPI = {
  // Get all members
  getAll: async () => {
    try {
      const response = await api.get('/members');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch members.');
      throw error;
    }
  },

  // Get member by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/members/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch member details.');
      throw error;
    }
  },

  // Add a new member
  create: async (memberData) => {
    try {
      const response = await api.post('/members', memberData);
      console.log(response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create member.');
      throw error;
    }
  },

  // Update a member
  update: async (id, memberData) => {
    try {
      const response = await api.put(`/members/${id}`, memberData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update member.');
      throw error;
    }
  },

  // Get public members (no authentication)
  getPublicMembers: async (params = {}) => {
    try {
      const response = await api.get('/members/public', { params });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch public members.');
      throw error;
    }
  },

  // Delete a member
  delete: async (id) => {
    try {
      const response = await api.delete(`/members/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete member.');
      throw error;
    }
  },

  // Get member statistics
  getStats: async () => {
    try {
      const response = await api.get('/members/stats');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch member statistics.');
      throw error;
    }
  },

  // Get member statistics by ID
  getStatsById: async (id) => {
    try {
      const response = await api.get(`/members/${id}/stats`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch member statistics.');
      throw error;
    }
  },
};

// Backward compatibility exports
export const getMembers = memberAPI.getAll;
export const addMember = memberAPI.create;
export const updateMember = memberAPI.update;
export const deleteMember = memberAPI.delete;
export const getPublicMembers = memberAPI.getPublicMembers;