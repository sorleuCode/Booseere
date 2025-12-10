import api from './axios';
import { handleApiError } from '../utils/errorHandler';

// Contact API
export const contactAPI = {
  // Submit contact form
  submit: async (contactData) => {
    try {
      const response = await api.post('/contact', contactData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to submit contact form.');
      throw error;
    }
  },
};