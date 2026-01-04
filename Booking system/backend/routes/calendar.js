const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = require('../utils/calendarIntegration');

const router = express.Router();

// @desc      Sync appointment to calendar
// @route     POST /api/calendar/sync/:appointmentId
// @access    Private
router.post('/sync/:appointmentId', protect, authorize('admin', 'staff'), asyncHandler(async (req, res, next) => {
  // This endpoint would be used to manually sync an appointment to calendars
  const { platforms = ['google'] } = req.body;
  
  // In a real implementation, you would fetch the appointment and sync it
  // For now, we'll just return a success response
  const result = await createCalendarEvent({ id: req.params.appointmentId }, platforms);
  
  res.status(200).json({
    success: true,
    data: result
  });
}));

// @desc      Get calendar integration status
// @route     GET /api/calendar/status
// @access    Private
router.get('/status', protect, authorize('admin', 'staff'), asyncHandler(async (req, res, next) => {
  // Return the status of calendar integrations
  res.status(200).json({
    success: true,
    data: {
      googleCalendar: !!process.env.GOOGLE_CLIENT_ID,
      facebookCalendar: false, // Not implemented yet
      outlookCalendar: false,  // Not implemented yet
    }
  });
}));

// @desc      Get calendar settings for staff
// @route     GET /api/calendar/settings
// @access    Private/Staff
router.get('/settings', protect, authorize('staff'), asyncHandler(async (req, res, next) => {
  // Return calendar settings for the staff member
  res.status(200).json({
    success: true,
    data: {
      calendarId: req.user.Staff?.calendarId || null,
      syncEnabled: !!req.user.Staff?.calendarId
    }
  });
}));

// @desc      Update calendar settings for staff
// @route     PUT /api/calendar/settings
// @access    Private/Staff
router.put('/settings', protect, authorize('staff'), asyncHandler(async (req, res, next) => {
  const { calendarId } = req.body;
  
  if (!calendarId) {
    return next(new ErrorResponse('Calendar ID is required', 400));
  }
  
  // Update the staff member's calendar ID
  if (!req.user.Staff) {
    return next(new ErrorResponse('Staff profile not found', 404));
  }
  
  await req.user.Staff.update({ calendarId });
  
  res.status(200).json({
    success: true,
    data: {
      calendarId: req.user.Staff.calendarId,
      syncEnabled: true
    }
  });
}));

module.exports = router;