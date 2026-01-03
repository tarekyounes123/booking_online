const { body, validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: extractedErrors
    });
  };
};

// User registration validation
const validateRegister = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('First name must be between 2 and 30 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Last name must be between 2 and 30 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .exists()
    .withMessage('Password is required')
];

// Appointment validation
const validateAppointment = [
  body('serviceId')
    .isInt({ min: 1 })
    .withMessage('Service ID must be a positive integer'),
  body('date')
    .isISO8601()
    .withMessage('Date must be in ISO8601 format (YYYY-MM-DD)'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM:SS format'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM:SS format'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Service validation
const validateService = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('duration')
    .isInt({ min: 1, max: 1440 }) // Max 24 hours in minutes
    .withMessage('Duration must be between 1 and 1440 minutes'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
];

// Payment validation (now for promotion application)
const validatePayment = [
  body('appointmentId')
    .isInt({ min: 1 })
    .withMessage('Appointment ID must be a positive integer'),
  body('promoCode')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Promo code must be at most 50 characters')
];

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateAppointment,
  validateService,
  validatePayment
};