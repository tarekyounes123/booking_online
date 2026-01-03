const { Staff, User, Branch, Appointment } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get all staff
// @route     GET /api/staff
// @access    Public
exports.getStaff = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findAll({
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar']
      },
      {
        model: Branch,
        attributes: ['id', 'name', 'address', 'city']
      }
    ],
    where: { isActive: true },
    order: [['createdAt', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: staff.length,
    data: staff
  });
});

// @desc      Get single staff member
// @route     GET /api/staff/:id
// @access    Public
exports.getStaffMember = asyncHandler(async (req, res, next) => {
  const staffMember = await Staff.findByPk(req.params.id, {
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar']
      },
      {
        model: Branch,
        attributes: ['id', 'name', 'address', 'city']
      }
    ]
  });

  if (!staffMember || !staffMember.isActive) {
    return next(
      new ErrorResponse(`Staff member not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: staffMember
  });
});

// @desc      Create new staff member
// @route     POST /api/staff
// @access    Private/Admin
exports.createStaff = asyncHandler(async (req, res, next) => {
  // First, we need to create a user with staff role
  const user = await User.create({
    ...req.body.user,
    role: 'staff'
  });

  // Then create the staff record
  const staff = await Staff.create({
    userId: user.id,
    ...req.body.staff
  });

  // Include the user data in the response
  const staffWithUser = await Staff.findByPk(staff.id, {
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar']
      }
    ]
  });

  res.status(201).json({
    success: true,
    data: staffWithUser
  });
});

// @desc      Update staff member
// @route     PUT /api/staff/:id
// @access    Private/Admin
exports.updateStaff = asyncHandler(async (req, res, next) => {
  let staff = await Staff.findByPk(req.params.id, {
    include: [{ model: User }]
  });

  if (!staff) {
    return next(
      new ErrorResponse(`Staff member not found with id of ${req.params.id}`, 404)
    );
  }

  // Update user details if provided
  if (req.body.user) {
    await staff.User.update(req.body.user);
  }

  // Update staff details
  if (req.body.staff) {
    staff = await staff.update(req.body.staff);
  }

  // Fetch updated staff with user
  const updatedStaff = await Staff.findByPk(req.params.id, {
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar']
      }
    ]
  });

  res.status(200).json({
    success: true,
    data: updatedStaff
  });
});

// @desc      Delete staff member
// @route     DELETE /api/staff/:id
// @access    Private/Admin
exports.deleteStaff = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findByPk(req.params.id);

  if (!staff) {
    return next(
      new ErrorResponse(`Staff member not found with id of ${req.params.id}`, 404)
    );
  }

  // Update the user's role to customer
  await User.update({ role: 'customer' }, { where: { id: staff.userId } });

  await staff.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get staff appointments
// @route     GET /api/staff/:id/appointments
// @access    Private
exports.getStaffAppointments = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findByPk(req.params.id);

  if (!staff) {
    return next(
      new ErrorResponse(`Staff member not found with id of ${req.params.id}`, 404)
    );
  }

  // Authorization check
  if (req.user.role !== 'admin' && req.user.id !== staff.userId) {
    return next(
      new ErrorResponse(
        `User not authorized to access this staff member's appointments`,
        401
      )
    );
  }

  const appointments = await Appointment.findAll({
    where: { staffId: req.params.id },
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: Service,
        attributes: ['id', 'name', 'price']
      }
    ],
    order: [['date', 'ASC'], ['startTime', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// @desc      Get staff by branch
// @route     GET /api/staff/branch/:branchId
// @access    Public
exports.getStaffByBranch = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findAll({
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar']
      },
      {
        model: Branch,
        where: { id: req.params.branchId }, // Only staff from the specified branch
        attributes: ['id', 'name', 'address', 'city']
      }
    ],
    where: { isActive: true },
    order: [['createdAt', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: staff.length,
    data: staff
  });
});