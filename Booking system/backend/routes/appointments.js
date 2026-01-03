const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAvailableSlots
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validateAppointment } = require('../middleware/validation');

const router = express.Router();

router
  .route('/')
  .get(protect, getAppointments)
  .post(protect, validate(validateAppointment), createAppointment);

router
  .route('/available-slots')
  .get(protect, getAvailableSlots);

router
  .route('/:id')
  .get(protect, getAppointment)
  .put(protect, validate(validateAppointment), updateAppointment)
  .delete(protect, deleteAppointment);

router
  .route('/:id/status')
  .put(protect, updateAppointmentStatus);

module.exports = router;