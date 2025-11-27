import api from './axios';

// Contact API
export const contactAPI = {
  // Submit contact form
  submit: async (contactData) => {
    const response = await api.post('/contact', contactData);
    return response.data;
  },
};