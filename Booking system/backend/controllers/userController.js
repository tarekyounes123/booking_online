const { User, Appointment, Payment, Notification } = require('../models');
const { Op } = require('sequelize');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       email:
 *                         type: string
 *                         example: john.doe@example.com
 *                       role:
 *                         type: string
 *                         example: customer
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     role:
 *                       type: string
 *                       example: customer
 *       404:
 *         description: User not found
 */

// @desc      Get all users
// @route     GET /api/users
// @access    Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc      Get single user
// @route     GET /api/users/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
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
 *               role:
 *                 type: string
 *                 example: admin
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     role:
 *                       type: string
 *                       example: admin
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */

// @desc      Update user
// @route     PUT /api/users/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  try {
    // Only allow specific fields to be updated
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'role', 'isActive', 'branchId'];
    const fieldsToUpdate = {};

    // Filter only allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    // Validate email uniqueness if email is being updated
    if (fieldsToUpdate.email) {
      const existingUser = await User.findOne({
        where: {
          email: fieldsToUpdate.email,
          id: { [Op.ne]: req.params.id } // Exclude current user
        }
      });

      if (existingUser) {
        return next(new ErrorResponse('Email is already in use', 400));
      }
    }

    // Validate role if being updated
    if (fieldsToUpdate.role) {
      const allowedRoles = ['customer', 'admin', 'staff'];
      if (!allowedRoles.includes(fieldsToUpdate.role)) {
        return next(new ErrorResponse(`Invalid role. Allowed roles are: ${allowedRoles.join(', ')}`, 400));
      }
    }

    const [updatedRowsCount] = await User.update(fieldsToUpdate, {
      where: { id: req.params.id }
    });

    if (updatedRowsCount === 0) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return next(new ErrorResponse(`Validation Error: ${messages.join(', ')}`, 400));
    }

    // Handle other errors
    return next(new ErrorResponse(`Error updating user: ${error.message}`, 500));
  }
});

// @desc      Delete user
// @route     DELETE /api/users/:id
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  await user.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get user appointments
// @route     GET /api/users/:id/appointments
// @access    Private/Admin
exports.getUserAppointments = asyncHandler(async (req, res, next) => {
  const appointments = await Appointment.findAll({
    where: { userId: req.params.id },
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: Payment,
        attributes: ['id', 'amount', 'status', 'paidAt']
      }
    ]
  });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// @desc      Get user payments
// @route     GET /api/users/:id/payments
// @access    Private/Admin
exports.getUserPayments = asyncHandler(async (req, res, next) => {
  const payments = await Payment.findAll({
    where: { userId: req.params.id },
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: Appointment,
        attributes: ['id', 'date', 'startTime', 'endTime', 'status']
      }
    ]
  });

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});