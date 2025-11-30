import axios from 'axios';

// Create axios instance with base URL pointing to Version 2 backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on a public page
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/public-members', '/constitution', '/law'];

      if (!publicPaths.includes(currentPath)) {
        // Clear all auth data on unauthorized
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        // Use window.location for immediate redirect to avoid state issues
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;