const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('sequelize');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 */

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Set cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.generateToken();

  // Set cookie options
  let options = {
    expires: new Date(
      Date.now() + parseInt(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  // For cross-origin requests with credentials:
  // - In production (secure: true): sameSite can be 'none' to allow cross-origin
  // - In development (secure: false): Chrome requires 'lax' for cross-origin with credentials
  if (process.env.NODE_ENV === 'production') {
    options.sameSite = 'none';
  } else {
    // For Chrome in development with cross-origin requests and credentials,
    // we use 'lax' which should work for most cases
    options.sameSite = 'lax';
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new ErrorResponse('Email is already registered', 400));
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: role || 'customer' // Default to customer if no role specified
    });

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set verification code and expiration (10 minutes)
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Email content
    const message = `Your verification code is: ${verificationCode}\n\nThis code will expire in 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Account Verification Code',
        message,
      });

      res.status(200).json({
        success: true,
        message: 'User registered successfully. Please check your email for the verification code.',
        userId: user.id // Return user ID for verification step
      });
    } catch (err) {
      console.error('Email could not be sent. Full error:', err);

      // If email fails, delete the user to allow them to register again
      await User.destroy({ where: { id: user.id } });

      // Provide more specific error information
      let errorMessage = 'Email could not be sent, please try again.';
      if (err.response && err.response.code) {
        errorMessage = `Email service error: ${err.response.code}. Please contact support.`;
      } else if (err.message && err.message.includes('ETIMEDOUT')) {
        errorMessage = 'Email service timeout. Please try again later.';
      } else if (err.message && err.message.includes('ECONNREFUSED')) {
        errorMessage = 'Email service connection refused. Please contact support.';
      } else if (err.message && err.message.includes('authentication')) {
        errorMessage = 'Email authentication failed. Please contact support.';
      }

      return next(new ErrorResponse(errorMessage, 500));
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new ErrorResponse('Email is already registered', 400));
    }
    return next(new ErrorResponse('Registration failed', 500));
  }
};

// @desc    Verify user account with code
// @route   POST /api/auth/verify
// @access  Public
exports.verifyUser = async (req, res, next) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return next(new ErrorResponse('User ID and verification code are required', 400));
    }

    const user = await User.findOne({
      where: {
        id: userId,
        isVerified: false
      }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid user or account already verified', 400));
    }

    // Check if verification code matches and hasn't expired
    if (user.verificationCode !== code) {
      return next(new ErrorResponse('Invalid verification code', 400));
    }

    if (user.verificationCodeExpires < Date.now()) {
      return next(new ErrorResponse('Verification code has expired', 400));
    }

    // Update user - mark as verified and clear verification fields
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Account verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ErrorResponse('Email is required', 400));
    }

    const user = await User.findOne({
      where: {
        email,
        isVerified: false
      }
    });

    if (!user) {
      return next(new ErrorResponse('User not found or already verified', 400));
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set new verification code and expiration (10 minutes)
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Email content
    const message = `Your new verification code is: ${verificationCode}\n\nThis code will expire in 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'New Account Verification Code',
        message,
      });

      res.status(200).json({
        success: true,
        message: 'New verification code sent successfully.'
      });
    } catch (err) {
      console.error('Email could not be sent. Full error:', err);

      // Provide more specific error information
      let errorMessage = 'Email could not be sent, please try again.';
      if (err.response && err.response.code) {
        errorMessage = `Email service error: ${err.response.code}. Please contact support.`;
      } else if (err.message && err.message.includes('ETIMEDOUT')) {
        errorMessage = 'Email service timeout. Please try again later.';
      } else if (err.message && err.message.includes('ECONNREFUSED')) {
        errorMessage = 'Email service connection refused. Please contact support.';
      } else if (err.message && err.message.includes('authentication')) {
        errorMessage = 'Email authentication failed. Please contact support.';
      }

      return next(new ErrorResponse(errorMessage, 500));
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({
    where: { email },
    attributes: { include: ['password'] } // Include password for comparison
  });

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  if (!user.isVerified) {
    return next(new ErrorResponse('Please verify your account first', 401));
  }

  sendTokenResponse(user, 200, res);
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  let options = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  // For cross-origin requests with credentials:
  // - In production (secure: true): sameSite can be 'none' to allow cross-origin
  // - In development (secure: false): Chrome requires 'lax' for cross-origin with credentials
  if (process.env.NODE_ENV === 'production') {
    options.sameSite = 'none';
  } else {
    // For Chrome in development with cross-origin requests and credentials,
    // we use 'lax' which should work for most cases
    options.sameSite = 'lax';
  }

  res
    .status(200)
    .cookie('token', 'none', options)
    .json({
      success: true,
      data: {},
    });
};

// @desc    Get current logged in user
// @route   POST /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  res.status(200).json({
    success: true,
    data: user,
  });
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  // Only allow specific fields to be updated
  const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'avatar'];
  const fieldsToUpdate = {};

  // Filter only allowed fields
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  // Handle avatar upload if file is provided
  if (req.file) {
    fieldsToUpdate.avatar = req.file.path; // or req.file.location if using cloud storage
  }

  // Validate email if provided
  if (fieldsToUpdate.email) {
    const existingUser = await User.findOne({
      where: {
        email: fieldsToUpdate.email,
        id: { [Op.ne]: req.user.id } // Exclude current user
      }
    });

    if (existingUser) {
      return next(new ErrorResponse('Email is already in use', 400));
    }
  }

  try {
    const [updatedRowsCount] = await User.update(fieldsToUpdate, {
      where: { id: req.user.id }
    });

    if (updatedRowsCount === 0) {
      return next(new ErrorResponse('User not found', 404));
    }

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    return next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { include: ['password'] }
  });

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({
    where: { email: req.body.email }
  });

  // Even if user is not found, return success to prevent user enumeration
  if (!user) {
    res.status(200).json({ success: true, data: 'Password reset email sent' });
    return;
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
    });

    res.status(200).json({ success: true, data: 'Password reset email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    // Provide more specific error information
    let errorMessage = 'Email could not be sent, please try again.';
    if (err.response && err.response.code) {
      errorMessage = `Email service error: ${err.response.code}. Please contact support.`;
    } else if (err.message && err.message.includes('ETIMEDOUT')) {
      errorMessage = 'Email service timeout. Please try again later.';
    } else if (err.message && err.message.includes('ECONNREFUSED')) {
      errorMessage = 'Email service connection refused. Please contact support.';
    } else if (err.message && err.message.includes('authentication')) {
      errorMessage = 'Email authentication failed. Please contact support.';
    }

    return next(new ErrorResponse(errorMessage, 500));
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    where: {
      resetPasswordToken,
      resetPasswordExpire: { [Op.gt]: Date.now() }
    }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;

  // Remove reset tokens
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
};