const cron = require('node-cron');
const { Appointment, Notification, User } = require('../models');
const { sendAppointmentReminderUtil } = require('../controllers/notificationController');

// Schedule daily check for appointments that need reminders
const scheduleAppointmentReminders = () => {
  // Run every hour to check for appointments that need reminders
  cron.schedule('0 * * * *', async () => {
    console.log('Checking for appointments that need reminders...');

    try {
      // Get appointments for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const appointments = await Appointment.findAll({
        where: {
          date: tomorrowStr,
          reminderSent: false,
          status: 'confirmed' // Only send reminders for confirmed appointments
        },
        include: [
          {
            model: User,
            attributes: ['id', 'email']
          }
        ]
      });

      // Send reminders for each appointment
      for (const appointment of appointments) {
        try {
          await sendAppointmentReminderUtil(appointment, 'upcoming');
          console.log(`Reminder sent for appointment ${appointment.id} to user ${appointment.userId}`);

          // Update that reminder has been sent
          await appointment.update({ reminderSent: true });
        } catch (error) {
          console.error(`Error sending reminder for appointment ${appointment.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in appointment reminder scheduler:', error);
    }
  });

  // Run every day at 9 AM to send same-day appointment reminders
  cron.schedule('0 9 * * *', async () => {
    console.log('Checking for same-day appointments that need reminders...');

    try {
      // Get appointments for today
      const today = new Date().toISOString().split('T')[0];

      const appointments = await Appointment.findAll({
        where: {
          date: today,
          reminderSent: false,
          status: 'confirmed'
        },
        include: [
          {
            model: User,
            attributes: ['id', 'email']
          }
        ]
      });

      // Send same-day reminders
      for (const appointment of appointments) {
        try {
          await sendAppointmentReminderUtil(appointment, 'same-day');
          console.log(`Same-day reminder sent for appointment ${appointment.id} to user ${appointment.userId}`);

          // Update that reminder has been sent
          await appointment.update({ reminderSent: true });
        } catch (error) {
          console.error(`Error sending same-day reminder for appointment ${appointment.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in same-day appointment reminder scheduler:', error);
    }
  });
};

module.exports = { scheduleAppointmentReminders };