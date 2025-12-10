/**
 * Centralized error handling utility for API calls
 * Extracts and displays backend error messages using toast notifications
 */

import { toast } from 'react-toastify';

/**
 * Handle API errors and display them as toast notifications
 * @param {Error} error - The error object from API call
 * @param {string} fallbackMessage - Fallback message if no error message is found
 * @param {string} type - Toast type (error, warning, info, success)
 */
export const handleApiError = (error, fallbackMessage = 'An error occurred', type = 'error') => {

  // Extract error message from different possible locations
  let errorMessage = fallbackMessage;

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    } else if (error.response.data && typeof error.response.data === 'string') {
      errorMessage = error.response.data;
    } else if (error.response.status === 401) {
      errorMessage = 'Unauthorized access. Please login again.';
    } else if (error.response.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (error.response.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else {
      errorMessage = `Request failed with status ${error.response.status}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'Network error. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message || fallbackMessage;
  }

  // Show toast notification with the extracted error message
  if (type === 'error') {
    toast.error(errorMessage);
  } else if (type === 'warning') {
    toast.warning(errorMessage);
  } else if (type === 'info') {
    toast.info(errorMessage);
  } else if (type === 'success') {
    toast.success(errorMessage);
  } else {
    toast(errorMessage);
  }

  // Return the error for further handling if needed
  return error;
};

/**
 * Wrap API calls with error handling
 * @param {Function} apiCall - The API call function to wrap
 * @param {Object} options - Options for error handling
 * @returns {Promise} Promise that resolves with API response or rejects with handled error
 */
export const withErrorHandling = async (apiCall, options = {}) => {
  const {
    fallbackMessage = 'An error occurred',
    type = 'error',
    showSuccess = false,
    successMessage = 'Operation successful'
  } = options;

  try {
    const response = await apiCall();
    if (showSuccess && response.success) {
      toast.success(successMessage);
    }
    return response;
  } catch (error) {
    handleApiError(error, fallbackMessage, type);
    throw error; // Re-throw to allow further handling
  }
};

/**
 * Create an error handler for specific API contexts
 * @param {string} context - Context for error messages (e.g., "Login", "Registration")
 * @returns {Object} Error handling functions
 */
export const createContextErrorHandler = (context) => {
  return {
    handleError: (error) => handleApiError(error, `${context} failed. Please try again.`),
    handleSuccess: (message) => {
      toast.success(message || `${context} successful`);
    }
  };
};