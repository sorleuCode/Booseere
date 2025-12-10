/**
 * Utility for creating consistent error responses
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {object} additionalData - Additional data to include in response
 * @returns {AppError} Custom error instance
 */
const createError = (message, statusCode, additionalData = {}) => {
  const error = new AppError(message, statusCode);

  // Add additional data to the error
  Object.keys(additionalData).forEach(key => {
    error[key] = additionalData[key];
  });

  return error;
};

/**
 * Common error types
 */
const errors = {
  // 400 Bad Request
  badRequest: (message = 'Bad request') => createError(message, 400),

  // 401 Unauthorized
  unauthorized: (message = 'Unauthorized - please authenticate') => createError(message, 401),

  // 403 Forbidden
  forbidden: (message = 'Forbidden - you do not have permission') => createError(message, 403),

  // 404 Not Found
  notFound: (message = 'Resource not found') => createError(message, 404),

  // 409 Conflict
  conflict: (message = 'Conflict - resource already exists') => createError(message, 409),

  // 422 Unprocessable Entity (Validation)
  validationError: (message = 'Validation failed', errors = []) => {
    return createError(message, 422, { validationErrors: errors });
  },

  // 500 Internal Server Error
  serverError: (message = 'Internal server error') => createError(message, 500),

  // Custom error with specific status code
  custom: (message, statusCode) => createError(message, statusCode)
};

// Export the main classes and functions
export { AppError, createError, errors };