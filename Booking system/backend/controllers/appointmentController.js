const { Appointment, User, Service, Staff, Payment, Branch } = require('../models');
const { Op } = require('sequelize');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = require('../utils/calendarIntegration');
const webhookService = require('../utils/webhookService');

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management
 */

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
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
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2023-12-25"
 *                       startTime:
 *                         type: string
 *                         example: "09:00:00"
 *                       endTime:
 *                         type: string
 *                         example: "10:00:00"
 *                       status:
 *                         type: string
 *                         example: "pending"
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: integer
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-25"
 *               startTime:
 *                 type: string
 *                 example: "09:00:00"
 *               endTime:
 *                 type: string
 *                 example: "10:00:00"
 *               staffId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Appointment created successfully
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
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2023-12-25"
 *                     startTime:
 *                       type: string
 *                       example: "09:00:00"
 *                     endTime:
 *                       type: string
 *                       example: "10:00:00"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *       400:
 *         description: Validation error
 */

// @desc      Get all appointments
// @route     GET /api/appointments
// @access    Private
exports.getAppointments = asyncHandler(async (req, res, next) => {
  let appointments;

  if (req.user.role === 'admin') {
    // Admin can see all appointments
    appointments = await Appointment.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'price']
        },
        {
          model: Staff,
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName']
          }]
        },
        {
          model: Payment,
          attributes: ['id', 'amount', 'status']
        }
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
  } else if (req.user.role === 'staff') {
    // Staff can see their assigned appointments
    appointments = await Appointment.findAll({
      where: { staffId: req.user.Staff ? req.user.Staff.id : null },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'price']
        }
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
  } else {
    // Customer can only see their own appointments
    appointments = await Appointment.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'price']
        },
        {
          model: Staff,
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName']
          }]
        },
        {
          model: Payment,
          attributes: ['id', 'amount', 'status']
        }
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
  }

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// @desc      Get single appointment
// @route     GET /api/appointments/:id
// @access    Private
exports.getAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findByPk(req.params.id, {
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      },
      {
        model: Service,
        attributes: ['id', 'name', 'price', 'duration']
      },
      {
        model: Staff,
        include: [{
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        }]
      },
      {
        model: Payment,
        attributes: ['id', 'amount', 'status', 'paidAt']
      }
    ]
  });

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Authorization check
  if (
    req.user.role !== 'admin' &&
    req.user.role !== 'staff' &&
    appointment.userId !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        `User not authorized to access this appointment`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc      Create new appointment
// @route     POST /api/appointments
// @access    Private
exports.createAppointment = asyncHandler(async (req, res, next) => {
  // Sanitize and validate inputs
  const { serviceId, date, startTime, endTime, notes, location, staffId, paymentMethod } = req.body;

  // Get the service to get its price
  const service = await Service.findByPk(parseInt(serviceId));
  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${serviceId}`, 404)
    );
  }

  // Add user ID to body
  const appointmentData = {
    userId: req.user.id,
    serviceId: parseInt(serviceId),
    date: date,
    startTime: startTime,
    endTime: endTime,
    notes: notes ? String(notes).trim() : null,
    location: location ? String(location).trim() : null,
    staffId: staffId && !isNaN(staffId) ? parseInt(staffId) : null,
    paymentMethod: paymentMethod || 'cash', // Default to cash if not specified
    originalPrice: parseFloat(service.price), // Set the original price from the service
    discountedPrice: parseFloat(service.price) // Initially same as original price
  };

  // Check for existing appointment at the same time
  const existingAppointment = await Appointment.findOne({
    where: {
      date: appointmentData.date,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      [Op.or]: [
        { staffId: appointmentData.staffId },
        { userId: appointmentData.userId }
      ]
    }
  });

  if (existingAppointment) {
    return next(
      new ErrorResponse(
        'An appointment already exists at this time',
        400
      )
    );
  }

  const newAppointment = await Appointment.create(appointmentData);

  // --- Create Calendar Events ---
  // Using setTimeout to create calendar events asynchronously without blocking the response
  setTimeout(async () => {
    try {
      const appointmentDetails = await Appointment.findByPk(newAppointment.id, {
        include: [
          { model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] },
          { model: Service, attributes: ['name', 'duration', 'price'] },
          {
            model: Staff,
            include: [{ model: User, attributes: ['firstName', 'lastName'] }]
          }
        ]
      });

      if (appointmentDetails) {
        // Create calendar events for the appointment
        await createCalendarEvent(appointmentDetails, ['google']);
        console.log(`Calendar events created for appointment ${appointmentDetails.id}`);
      }
    } catch (error) {
      console.error('Could not create calendar events. Error:', error);
      // Do not block the response for this failure. The appointment is already booked.
    }
  }, 0);
  // --- End of Calendar Event Logic ---

  // --- Trigger Webhooks ---
  // Using setTimeout to trigger webhooks asynchronously without blocking the response
  setTimeout(async () => {
    try {
      const appointmentDetails = await Appointment.findByPk(newAppointment.id, {
        include: [
          { model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] },
          { model: Service, attributes: ['name', 'duration', 'price'] },
          {
            model: Staff,
            include: [{ model: User, attributes: ['firstName', 'lastName'] }]
          }
        ]
      });

      if (appointmentDetails) {
        // Trigger webhook for appointment creation
        await webhookService.triggerWebhooks('appointment.created', {
          appointment: appointmentDetails.toJSON(),
          timestamp: new Date().toISOString()
        });
        console.log(`Webhooks triggered for appointment creation ${appointmentDetails.id}`);
      }
    } catch (error) {
      console.error('Could not trigger webhooks for appointment creation. Error:', error);
      // Do not block the response for this failure. The appointment is already booked.
    }
  }, 0);
  // --- End of Webhook Logic ---

  // --- Send Confirmation Email ---
  // Using setTimeout to send email asynchronously without blocking the response
  setTimeout(async () => {
    try {
      const appointmentDetails = await Appointment.findByPk(newAppointment.id, {
        include: [
          { model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] },
          { model: Service, attributes: ['name', 'duration', 'price'] },
          {
            model: Staff,
            include: [{ model: User, attributes: ['firstName', 'lastName'] }]
          }
        ]
      });

      if (appointmentDetails && appointmentDetails.User) {
        const { User: customer, Service: service, Staff: staff } = appointmentDetails;

        const message = `
          Dear ${customer.firstName},

          This is a confirmation that your appointment has been successfully booked.

          Appointment Details:
          - Service: ${service.name}
          - Date: ${new Date(appointmentDetails.date).toLocaleDateString()}
          - Time: ${appointmentDetails.startTime} - ${appointmentDetails.endTime}
          - Staff: ${staff ? `${staff.User.firstName} ${staff.User.lastName}` : 'Any'}
          - Price: $${service.price}

          We look forward to seeing you.

          Sincerely,
          The Booking System Team
        `;

        await sendEmail({
          email: customer.email,
          subject: 'Your Appointment Confirmation',
          message
        });

        console.log(`Appointment confirmation email sent to ${customer.email}`);
      }
    } catch (error) {
      console.error('Could not send appointment confirmation email. Error:', error);
      // Do not block the response for this failure. The appointment is already booked.
    }
  }, 0);
  // --- End of Email Logic ---


  res.status(201).json({
    success: true,
    data: newAppointment
  });
});

// @desc      Update appointment
// @route     PUT /api/appointments/:id
// @access    Private
exports.updateAppointment = asyncHandler(async (req, res, next) => {
  // Find the appointment with related data
  const appointment = await Appointment.findByPk(req.params.id, {
    include: [
      { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Service, attributes: ['id', 'name'] },
      { model: Staff, include: [{ model: User, attributes: ['id', 'firstName', 'lastName'] }] }
    ]
  });

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Authorization check
  if (req.user.role !== 'admin' && appointment.userId !== req.user.id) {
    return next(
      new ErrorResponse(
        `User not authorized to update this appointment`,
        401
      )
    );
  }

  try {
    // Extract and validate the fields to update
    const { serviceId, date, startTime, endTime, status, notes, location, staffId } = req.body;


    // Build update object with proper validation
    const updateData = {};

    // Validate and add serviceId if provided
    if (serviceId !== undefined) {
      if (serviceId === null || serviceId === '') {
        updateData.serviceId = null;
      } else {
        const parsedServiceId = parseInt(serviceId);
        if (isNaN(parsedServiceId)) {
          return next(new ErrorResponse('Service ID must be a valid number', 400));
        }
        updateData.serviceId = parsedServiceId;
      }
    }

    // Validate and add date if provided
    if (date !== undefined) {
      if (date) {
        // Validate date format
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          return next(new ErrorResponse('Invalid date format', 400));
        }
        updateData.date = date;
      } else {
        updateData.date = null;
      }
    }

    // Validate and add startTime if provided
    if (startTime !== undefined) {
      if (startTime) {
        // Validate time format (HH:MM or HH:MM:SS)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        if (!timeRegex.test(startTime)) {
          return next(new ErrorResponse('Start time must be in HH:MM or HH:MM:SS format', 400));
        }
        // Convert to consistent HH:MM:SS format for database storage
        updateData.startTime = startTime.length === 5 ? startTime + ':00' : startTime;
      } else {
        updateData.startTime = null;
      }
    }

    // Validate and add endTime if provided
    if (endTime !== undefined) {
      if (endTime) {
        // Validate time format (HH:MM or HH:MM:SS)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        if (!timeRegex.test(endTime)) {
          return next(new ErrorResponse('End time must be in HH:MM or HH:MM:SS format', 400));
        }
        // Convert to consistent HH:MM:SS format for database storage
        updateData.endTime = endTime.length === 5 ? endTime + ':00' : endTime;
      } else {
        updateData.endTime = null;
      }
    }

    // Validate and add status if provided
    if (status !== undefined) {
      if (status) {
        const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];
        if (!allowedStatuses.includes(status)) {
          return next(
            new ErrorResponse(`Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}`, 400)
          );
        }
        updateData.status = status;
      } else {
        updateData.status = null;
      }
    }

    // Add notes if provided
    if (notes !== undefined) {
      updateData.notes = notes ? String(notes).trim() : null;
    }

    // Add location if provided
    if (location !== undefined) {
      updateData.location = location ? String(location).trim() : null;
    }

    // Validate and add staffId if provided
    if (staffId !== undefined) {
      if (staffId === null || staffId === '') {
        updateData.staffId = null;
      } else {
        const parsedStaffId = parseInt(staffId);
        if (isNaN(parsedStaffId)) {
          return next(new ErrorResponse('Staff ID must be a valid number', 400));
        }
        updateData.staffId = parsedStaffId;
      }
    }

    // Validate and add paymentMethod if provided
    if (req.body.paymentMethod !== undefined) {
      if (req.body.paymentMethod) {
        const allowedPaymentMethods = ['cash', 'online'];
        if (!allowedPaymentMethods.includes(req.body.paymentMethod)) {
          return next(
            new ErrorResponse(`Invalid payment method. Allowed methods are: ${allowedPaymentMethods.join(', ')}`, 400)
          );
        }
        updateData.paymentMethod = req.body.paymentMethod;
      } else {
        updateData.paymentMethod = null;
      }
    }

    // If time fields are being updated, ensure both are present and valid
    if (updateData.startTime !== undefined || updateData.endTime !== undefined) {
      // Use existing values if not being updated, ensuring proper format
      const finalStartTime = updateData.startTime !== undefined ? updateData.startTime :
                            appointment.startTime && appointment.startTime.length === 5 ?
                            appointment.startTime + ':00' : appointment.startTime;
      const finalEndTime = updateData.endTime !== undefined ? updateData.endTime :
                          appointment.endTime && appointment.endTime.length === 5 ?
                          appointment.endTime + ':00' : appointment.endTime;

      // Only validate if both values exist and are not null
      if (finalStartTime && finalEndTime) {
        // Validate that end time is after start time
        // Parse time strings to extract hours and minutes
        const parseTime = (timeStr) => {
          if (!timeStr) return null;
          const parts = timeStr.split(':');
          const [hours, minutes] = parts.map(Number);
          // Convert to total minutes for comparison
          return hours * 60 + minutes;
        };

        const startTotalMinutes = parseTime(finalStartTime);
        const endTotalMinutes = parseTime(finalEndTime);

        if (startTotalMinutes !== null && endTotalMinutes !== null && endTotalMinutes <= startTotalMinutes) {
          return next(new ErrorResponse('End time must be after start time', 400));
        }
      }
    }

    // Check for scheduling conflicts only if date or times are being updated
    if (updateData.date !== undefined || updateData.startTime !== undefined || updateData.endTime !== undefined) {
      let checkDate = updateData.date !== undefined ? updateData.date : appointment.date;
      let checkStartTime = updateData.startTime !== undefined ? updateData.startTime : appointment.startTime;
      let checkEndTime = updateData.endTime !== undefined ? updateData.endTime : appointment.endTime;

      // Format times to ensure consistent comparison (HH:MM:SS format)
      if (checkStartTime && checkStartTime.length === 5) { // HH:MM format
        checkStartTime = checkStartTime + ':00'; // Convert to HH:MM:SS
      }
      if (checkEndTime && checkEndTime.length === 5) { // HH:MM format
        checkEndTime = checkEndTime + ':00'; // Convert to HH:MM:SS
      }

      const checkStaffId = updateData.staffId !== undefined ? updateData.staffId : appointment.staffId;
      const checkUserId = appointment.userId; // Keep original user ID

      // Check for overlapping appointments
      const conflictConditions = {
        id: { [Op.ne]: appointment.id }, // Exclude current appointment
        date: checkDate
      };

      // Build conditions for potential conflicts
      const orConditions = [];

      // Check for user conflicts
      orConditions.push({
        userId: checkUserId,
        [Op.and]: [
          { startTime: { [Op.lt]: checkEndTime } },
          { endTime: { [Op.gt]: checkStartTime } }
        ]
      });

      // Check for staff conflicts if staff is assigned
      if (checkStaffId) {
        orConditions.push({
          staffId: checkStaffId,
          [Op.and]: [
            { startTime: { [Op.lt]: checkEndTime } },
            { endTime: { [Op.gt]: checkStartTime } }
          ]
        });
      }

      conflictConditions[Op.or] = orConditions;

      const conflictingAppointment = await Appointment.findOne({
        where: conflictConditions
      });

      if (conflictingAppointment) {
        return next(
          new ErrorResponse('An appointment already exists at this time', 400)
        );
      }
    }

    // Ensure time values are properly formatted for database storage (HH:MM:SS format)
    // This is critical for MySQL TIME fields
    if (updateData.startTime) {
      if (updateData.startTime.length === 5) { // If in HH:MM format
        updateData.startTime = updateData.startTime + ':00'; // Convert to HH:MM:SS
      }
    }
    if (updateData.endTime) {
      if (updateData.endTime.length === 5) { // If in HH:MM format
        updateData.endTime = updateData.endTime + ':00'; // Convert to HH:MM:SS
      }
    }

    // CRITICAL FIX: Ensure both startTime and endTime are present to satisfy model constraints
    // The model has allowNull: false for both startTime and endTime
    // If we're updating one time field, we must include the other with its current value
    if (updateData.hasOwnProperty('startTime') && !updateData.hasOwnProperty('endTime')) {
        // If updating startTime but not endTime, include current endTime
        updateData.endTime = appointment.endTime;
        // Ensure it's in correct format
        if (updateData.endTime && updateData.endTime.length === 5) {
            updateData.endTime = updateData.endTime + ':00';
        }
    } else if (updateData.hasOwnProperty('endTime') && !updateData.hasOwnProperty('startTime')) {
        // If updating endTime but not startTime, include current startTime
        updateData.startTime = appointment.startTime;
        // Ensure it's in correct format
        if (updateData.startTime && updateData.startTime.length === 5) {
            updateData.startTime = updateData.startTime + ':00';
        }
    }
    // If both or neither time fields are being updated, no additional action needed

    const updatedAppointment = await appointment.update(updateData, {
      validate: true // Explicitly enable validation
    });

    // --- Update Calendar Events ---
    // Using setTimeout to update calendar events asynchronously without blocking the response
    setTimeout(async () => {
      try {
        const appointmentDetails = await Appointment.findByPk(updatedAppointment.id, {
          include: [
            { model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] },
            { model: Service, attributes: ['name', 'duration', 'price'] },
            {
              model: Staff,
              include: [{ model: User, attributes: ['firstName', 'lastName'] }]
            }
          ]
        });

        if (appointmentDetails) {
          // Update calendar events for the appointment
          await updateCalendarEvent(appointmentDetails, ['google']);
          console.log(`Calendar events updated for appointment ${appointmentDetails.id}`);
        }
      } catch (error) {
        console.error('Could not update calendar events. Error:', error);
        // Do not block the response for this failure. The appointment is already updated.
      }
    }, 0);
    // --- End of Calendar Event Logic ---

    // --- Trigger Webhooks ---
    // Using setTimeout to trigger webhooks asynchronously without blocking the response
    setTimeout(async () => {
      try {
        const appointmentDetails = await Appointment.findByPk(updatedAppointment.id, {
          include: [
            { model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] },
            { model: Service, attributes: ['name', 'duration', 'price'] },
            {
              model: Staff,
              include: [{ model: User, attributes: ['firstName', 'lastName'] }]
            }
          ]
        });

        if (appointmentDetails) {
          // Trigger webhook for appointment update
          await webhookService.triggerWebhooks('appointment.updated', {
            appointment: appointmentDetails.toJSON(),
            timestamp: new Date().toISOString()
          });
          console.log(`Webhooks triggered for appointment update ${appointmentDetails.id}`);
        }
      } catch (error) {
        console.error('Could not trigger webhooks for appointment update. Error:', error);
        // Do not block the response for this failure. The appointment is already updated.
      }
    }, 0);
    // --- End of Webhook Logic ---

    res.status(200).json({
      success: true,
      data: updatedAppointment
    });

  } catch (error) {
    // Handle any validation or database errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors ? error.errors.map(err => err.message) : [error.message];
      return next(new ErrorResponse(`Validation Error: ${messages.join(', ')}`, 400));
    }

    return next(new ErrorResponse(`Error updating appointment: ${error.message}`, 500));
  }
});

// @desc      Update appointment status
// @route     PUT /api/appointments/:id/status
// @access    Private
exports.updateAppointmentStatus = asyncHandler(async (req, res, next) => {
  const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];
  
  if (!allowedStatuses.includes(req.body.status)) {
    return next(
      new ErrorResponse(
        `Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}`,
        400
      )
    );
  }

  let appointment = await Appointment.findByPk(req.params.id);

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Authorization check - only admin or assigned staff can update status
  if (
    req.user.role !== 'admin' && 
    (req.user.role !== 'staff' || appointment.staffId !== req.user.Staff?.id)
  ) {
    return next(
      new ErrorResponse(
        `User not authorized to update appointment status`,
        401
      )
    );
  }

  appointment = await appointment.update({ status: req.body.status });

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc      Delete appointment
// @route     DELETE /api/appointments/:id
// @access    Private
exports.deleteAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findByPk(req.params.id);

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Authorization check
  if (req.user.role !== 'admin' && appointment.userId !== req.user.id) {
    return next(
      new ErrorResponse(
        `User not authorized to delete this appointment`,
        401
      )
    );
  }

  // --- Delete Calendar Events ---
  // Using setTimeout to delete calendar events asynchronously before the appointment is deleted
  setTimeout(async () => {
    try {
      // Get the appointment details before deletion
      const appointmentDetails = await Appointment.findByPk(appointment.id, {
        include: [
          { model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] },
          { model: Service, attributes: ['name', 'duration', 'price'] },
          {
            model: Staff,
            include: [{ model: User, attributes: ['firstName', 'lastName'] }]
          }
        ]
      });

      if (appointmentDetails) {
        // Delete calendar events for the appointment
        await deleteCalendarEvent(appointmentDetails, ['google']);
        console.log(`Calendar events deleted for appointment ${appointmentDetails.id}`);
      }
    } catch (error) {
      console.error('Could not delete calendar events. Error:', error);
      // Do not block the response for this failure. The appointment will still be deleted.
    }
  }, 0);
  // --- End of Calendar Event Logic ---

  // --- Trigger Webhooks ---
  // Using setTimeout to trigger webhooks asynchronously before the appointment is deleted
  setTimeout(async () => {
    try {
      // Get the appointment details before deletion
      const appointmentDetails = await Appointment.findByPk(appointment.id, {
        include: [
          { model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] },
          { model: Service, attributes: ['name', 'duration', 'price'] },
          {
            model: Staff,
            include: [{ model: User, attributes: ['firstName', 'lastName'] }]
          }
        ]
      });

      if (appointmentDetails) {
        // Trigger webhook for appointment deletion
        await webhookService.triggerWebhooks('appointment.deleted', {
          appointment: appointmentDetails.toJSON(),
          timestamp: new Date().toISOString()
        });
        console.log(`Webhooks triggered for appointment deletion ${appointmentDetails.id}`);
      }
    } catch (error) {
      console.error('Could not trigger webhooks for appointment deletion. Error:', error);
      // Do not block the response for this failure. The appointment will still be deleted.
    }
  }, 0);
  // --- End of Webhook Logic ---

  await appointment.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get available time slots for a service and staff
// @route     GET /api/appointments/available-slots
// @access    Private
exports.getAvailableSlots = asyncHandler(async (req, res, next) => {
  const { serviceId, staffId, date } = req.query;

  if (!serviceId || !date) {
    return next(
      new ErrorResponse('Service ID and date are required', 400)
    );
  }

  // Validate date format
  if (isNaN(Date.parse(date))) {
    return next(
      new ErrorResponse('Invalid date format. Please use YYYY-MM-DD format.', 400)
    );
  }

  // Get service duration
  const service = await Service.findByPk(parseInt(serviceId));
  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${serviceId}`, 404)
    );
  }

  // Define business hours (9 AM to 6 PM as example)
  const businessStartHour = 9;
  const businessEndHour = 18;
  const slotDuration = 30; // 30 minutes per slot

  // Get all appointments for the given date and staff
  const existingAppointments = await Appointment.findAll({
    where: {
      date: date,
      staffId: staffId && !isNaN(staffId) ? parseInt(staffId) : null // If no staff specified or invalid staffId, find appointments for any staff
    },
    attributes: ['startTime', 'endTime']
  });

  // Convert time strings to minutes for easier calculation
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  };

  // Create an array of busy time slots in minutes
  const busySlots = existingAppointments.map(appt => ({
    start: timeToMinutes(appt.startTime),
    end: timeToMinutes(appt.endTime)
  }));

  // Generate available time slots
  const availableSlots = [];
  let currentTime = businessStartHour * 60; // Start at 9 AM in minutes
  const endTime = businessEndHour * 60; // End at 6 PM in minutes

  while (currentTime < endTime) {
    const slotEnd = currentTime + service.duration;

    // Check if this slot conflicts with any existing appointments
    const isBusy = busySlots.some(busy =>
      (currentTime < busy.end && slotEnd > busy.start)
    );

    if (!isBusy && slotEnd <= endTime) {
      availableSlots.push({
        startTime: minutesToTime(currentTime),
        endTime: minutesToTime(slotEnd)
      });
    }

    currentTime += slotDuration; // Move to next slot
  }

  res.status(200).json({
    success: true,
    date,
    serviceId: parseInt(serviceId),
    staffId: staffId && !isNaN(staffId) ? parseInt(staffId) : null,
    availableSlots
  });
});