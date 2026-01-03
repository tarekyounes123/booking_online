const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const { User } = require('../models');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    console.error('No token found in cookies');
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] } // Don't include password in the result
    });

    if (!user) {
      console.error('No user found with id:', decoded.id);
      return next(new ErrorResponse('No user found with this id', 404));
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};