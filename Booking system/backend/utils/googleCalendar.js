const { google } = require('googleapis');
const { Appointment, User, Staff } = require('../models');

// Initialize Google Calendar API
const initializeCalendar = () => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return google.calendar({ version: 'v3', auth });
};

// Create calendar event
const createCalendarEvent = async (appointment) => {
  try {
    const calendar = initializeCalendar();

    // Get staff calendar ID
    const staff = await Staff.findByPk(appointment.staffId, {
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    if (!staff || !staff.calendarId) {
      throw new Error('Staff calendar not configured');
    }

    // Format appointment data for calendar event
    const event = {
      summary: `Appointment: ${appointment.Service.name}`,
      description: `Appointment with ${appointment.User.firstName} ${appointment.User.lastName}`,
      start: {
        dateTime: new Date(`${appointment.date}T${appointment.startTime}`).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(`${appointment.date}T${appointment.endTime}`).toISOString(),
        timeZone: 'UTC',
      },
      attendees: [
        { email: appointment.User.email },
        { email: staff.User.email }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 10 }        // 10 minutes before
        ],
      },
    };

    // Create the event
    const response = await calendar.events.insert({
      calendarId: staff.calendarId,
      resource: event,
      sendNotifications: true,
    });

    // Store the Google Calendar event ID in the appointment metadata
    if (response.data && response.data.id) {
      // Initialize metadata if it doesn't exist
      if (!appointment.metadata) {
        appointment.metadata = {};
      }

      // Update the appointment with the Google Calendar event ID
      appointment.metadata.googleEventId = response.data.id;
      await appointment.update({ metadata: appointment.metadata });
    }

    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

// Update calendar event
const updateCalendarEvent = async (appointment) => {
  try {
    const calendar = initializeCalendar();

    // Get staff calendar ID
    const staff = await Staff.findByPk(appointment.staffId, {
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    if (!staff || !staff.calendarId) {
      throw new Error('Staff calendar not configured');
    }

    // Find the existing event ID from appointment metadata
    if (!appointment.metadata || !appointment.metadata.googleEventId) {
      throw new Error('Google Calendar event ID not found');
    }

    const event = {
      summary: `Appointment: ${appointment.Service.name}`,
      description: `Appointment with ${appointment.User.firstName} ${appointment.User.lastName}`,
      start: {
        dateTime: new Date(`${appointment.date}T${appointment.startTime}`).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(`${appointment.date}T${appointment.endTime}`).toISOString(),
        timeZone: 'UTC',
      },
      attendees: [
        { email: appointment.User.email },
        { email: staff.User.email }
      ],
    };

    // Update the event
    const response = await calendar.events.update({
      calendarId: staff.calendarId,
      eventId: appointment.metadata.googleEventId,
      resource: event,
      sendNotifications: true,
    });

    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

// Delete calendar event
const deleteCalendarEvent = async (appointment) => {
  try {
    const calendar = initializeCalendar();

    // Get staff calendar ID
    const staff = await Staff.findByPk(appointment.staffId, {
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    if (!staff || !staff.calendarId) {
      throw new Error('Staff calendar not configured');
    }

    // Find the existing event ID from appointment metadata
    if (!appointment.metadata || !appointment.metadata.googleEventId) {
      throw new Error('Google Calendar event ID not found');
    }

    // Delete the event
    await calendar.events.delete({
      calendarId: staff.calendarId,
      eventId: appointment.metadata.googleEventId,
      sendNotifications: true,
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
};

module.exports = {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
};