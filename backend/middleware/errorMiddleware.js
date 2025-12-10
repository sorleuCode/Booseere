const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log the error for debugging
  console.error(`[${new Date().toISOString()}] Error ${statusCode}:`, err.message);

  // Prepare error response
  const errorResponse = {
    success: false,
    message: err.message || 'An error occurred',
    status: statusCode,
    timestamp: new Date().toISOString()
  };

  // Add stack trace only in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
    errorResponse.errorDetails = {
      name: err.name,
      code: err.code,
      ...(err.errors && { validationErrors: err.errors })
    };
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    errorResponse.message = 'Validation failed';
    errorResponse.errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  } else if (err.name === 'CastError') {
    errorResponse.message = 'Invalid ID format';
  } else if (err.code === 11000) { // MongoDB duplicate key error
    errorResponse.message = 'Duplicate entry - this value already exists';
  }

  res.status(statusCode).json(errorResponse);
};

// Error handler for async routes that don't use express-async-handler
export const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { errorHandler };
