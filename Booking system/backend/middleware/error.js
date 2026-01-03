const ErrorResponse = require('../utils/errorResponse');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log error to console for development
  console.log(err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Invalid foreign key reference';
    error = new ErrorResponse(message, 400);
  }

  // Handle API 404 not found
  if (error.statusCode === 404 && req.originalUrl.startsWith('/api')) {
    error.message = 'API route not found';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;