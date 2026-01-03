const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Rate limiting middleware for general requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.'
});

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs for auth routes (increased for development)
  message: 'Too many authentication attempts from this IP, please try again later.'
});

// Rate limiting for API routes (excluding auth)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs for API routes (increased for development)
  message: 'Too many API requests from this IP, please try again later.'
});

// Security middleware
const securityMiddleware = [
  // Set security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.stripe.com"],
      },
    },
  }),
  
  // Prevent XSS attacks
  xss(),
  
  // Sanitize data to prevent NoSQL injection
  mongoSanitize(),
  
  // Prevent parameter pollution
  hpp({
    whitelist: ['sort', 'limit', 'page', 'select'] // Allow these parameters to be duplicated
  })
];

module.exports = {
  limiter,
  authLimiter,
  apiLimiter,
  securityMiddleware
};