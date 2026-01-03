const { Notification, User, Appointment, Staff, Service } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');

// @desc      Get all notifications for user
// @route     GET /api/notifications
// @access    Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc      Get single notification
// @route     GET /api/notifications/:id
// @access    Private
exports.getNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id
    }
  });

  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc      Update notification (mark as read)
// @route     PUT /api/notifications/:id
// @access    Private
exports.updateNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id
    }
  });

  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }

  await notification.update({ isRead: true });

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc      Delete notification
// @route     DELETE /api/notifications/:id
// @access    Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id
    }
  });

  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }

  await notification.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Send notification to user
// @route     POST /api/notifications
// @access    Private/Admin
exports.sendNotification = asyncHandler(async (req, res, next) => {
  const { userId, title, message, type } = req.body;

  // Check if user exists
  const user = await User.findByPk(userId);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${userId}`, 404));
  }

  // Create notification
  const notification = await Notification.create({
    userId,
    title,
    message,
    type: type || 'in_app' // Default to in-app notification
  });

  // If it's an email notification, send the email
  if (type === 'email') {
    try {
      await sendEmail({
        email: user.email,
        subject: title,
        message: message
      });

      // Update notification status
      await notification.update({ status: 'sent', sentAt: new Date() });
    } catch (err) {
      // Update notification status to failed
      await notification.update({ status: 'failed' });
      return next(new ErrorResponse('Failed to send email notification', 500));
    }
  }

  res.status(201).json({
    success: true,
    data: notification
  });
});

// @desc      Send appointment reminder (API endpoint)
// @route     POST /api/notifications/appointment-reminder
// @access    Private/Admin
exports.sendAppointmentReminder = asyncHandler(async (req, res, next) => {
  const { appointmentId, reminderType = 'email' } = req.body;

  // Get appointment with user details
  const appointment = await Appointment.findByPk(appointmentId, {
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: Staff,
        include: [{
          model: User,
          attributes: ['firstName', 'lastName']
        }]
      },
      {
        model: Service,
        attributes: ['name']
      }
    ]
  });

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${appointmentId}`, 404)
    );
  }

  // Create reminder message
  const staffName = appointment.Staff 
    ? `${appointment.Staff.User.firstName} ${appointment.Staff.User.lastName}`
    : 'Assigned Staff';
    
  const message = `
    Hello ${appointment.User.firstName},
    
    This is a reminder for your upcoming appointment.
    
    Service: ${appointment.Service.name}
    Date: ${new Date(appointment.date).toDateString()}
    Time: ${appointment.startTime} - ${appointment.endTime}
    Staff: ${staffName}
    
    Please arrive a few minutes early for your appointment.
    
    Thank you!
  `;

  // Create notification
  const notification = await Notification.create({
    userId: appointment.userId,
    title: 'Appointment Reminder',
    message: message.trim(),
    type: reminderType
  });

  // Send the notification based on type
  if (reminderType === 'email') {
    try {
      await sendEmail({
        email: appointment.User.email,
        subject: 'Appointment Reminder',
        message: message
      });

      // Update notification status
      await notification.update({ status: 'sent', sentAt: new Date() });
    } catch (err) {
      // Update notification status to failed
      await notification.update({ status: 'failed' });
      return next(new ErrorResponse('Failed to send reminder email', 500));
    }
  }

  res.status(201).json({
    success: true,
    data: notification
  });
});

// Function to send appointment reminder directly (for scheduler use)
const sendAppointmentReminderUtil = async (appointment, reminderType = 'email') => {
  // Get appointment with user details
  const appointmentWithDetails = await Appointment.findByPk(appointment.id, {
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: Staff,
        include: [{
          model: User,
          attributes: ['firstName', 'lastName']
        }]
      },
      {
        model: Service,
        attributes: ['name']
      }
    ]
  });

  if (!appointmentWithDetails) {
    throw new Error(`Appointment not found with id of ${appointment.id}`);
  }

  // Create reminder message
  const staffName = appointmentWithDetails.Staff
    ? `${appointmentWithDetails.Staff.User.firstName} ${appointmentWithDetails.Staff.User.lastName}`
    : 'Assigned Staff';

  const message = `
    Hello ${appointmentWithDetails.User.firstName},

    This is a reminder for your upcoming appointment.

    Service: ${appointmentWithDetails.Service.name}
    Date: ${new Date(appointmentWithDetails.date).toDateString()}
    Time: ${appointmentWithDetails.startTime} - ${appointmentWithDetails.endTime}
    Staff: ${staffName}

    Please arrive a few minutes early for your appointment.

    Thank you!
  `;

  // Create notification
  const notification = await Notification.create({
    userId: appointmentWithDetails.userId,
    title: 'Appointment Reminder',
    message: message.trim(),
    type: reminderType
  });

  // Send the notification based on type
  if (reminderType === 'email') {
    try {
      await sendEmail({
        email: appointmentWithDetails.User.email,
        subject: 'Appointment Reminder',
        message: message
      });

      // Update notification status
      await notification.update({ status: 'sent', sentAt: new Date() });
    } catch (err) {
      // Update notification status to failed
      await notification.update({ status: 'failed' });
      throw new Error('Failed to send reminder email');
    }
  }

  return notification;
};

// Export the utility function for scheduler use
exports.sendAppointmentReminderUtil = sendAppointmentReminderUtil;

// @desc      Mark all notifications as read
// @route     PUT /api/notifications/mark-all-read
// @access    Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.update(
    { isRead: true },
    { where: { userId: req.user.id, isRead: false } }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc      Get unread notifications count
// @route     GET /api/notifications/unread-count
// @access    Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.count({
    where: { 
      userId: req.user.id, 
      isRead: false 
    }
  });

  res.status(200).json({
    success: true,
    count: count
  });
});