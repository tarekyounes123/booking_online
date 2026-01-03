const express = require('express');
const {
  getNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  sendAppointmentReminder,
  markAllAsRead,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getNotifications)
  .post(protect, authorize('admin'), sendNotification);

router
  .route('/unread-count')
  .get(protect, getUnreadCount);

router
  .route('/mark-all-read')
  .put(protect, markAllAsRead);

router
  .route('/appointment-reminder')
  .post(protect, authorize('admin'), sendAppointmentReminder);

router
  .route('/:id')
  .get(protect, getNotification)
  .put(protect, updateNotification)
  .delete(protect, deleteNotification);

module.exports = router;