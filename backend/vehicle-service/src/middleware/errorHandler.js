const { logger } = require('../utils/logger');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

// Error handler middleware
exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user ? req.user.id : 'anonymous'
  });

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json(
      ApiResponse.error(err.message, {
        stack: err.stack,
        error: err
      })
    );
  }

  // Production error response
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      ApiResponse.error(err.message, err.errors)
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    return res.status(400).json(
      ApiResponse.error('Validation Error', errors)
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json(
      ApiResponse.error(`Duplicate field value: ${field}. Please use another value.`)
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      ApiResponse.error('Invalid token. Please log in again.')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      ApiResponse.error('Your token has expired. Please log in again.')
    );
  }

  // Default error
  return res.status(500).json(
    ApiResponse.error('Something went wrong')
  );
}; 