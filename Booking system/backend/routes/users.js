const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserAppointments,
  getUserPayments
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Re-route into other resource routers
const appointmentRouter = require('./appointments');
const paymentRouter = require('./payments');

router.use('/:id/appointments', appointmentRouter);
router.use('/:id/payments', paymentRouter);

router.route('/').get(protect, authorize('admin'), getUsers);

router
  .route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;