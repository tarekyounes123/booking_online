const express = require('express');
const {
  createPaymentIntent,
  stripeWebhook,
  getPayment,
  getPayments,
  updatePayment,
  getPaymentReceipt
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { validate, validatePayment } = require('../middleware/validation');

const router = express.Router();

router
  .route('/create-intent')
  .post(protect, validate(validatePayment), createPaymentIntent);

router
  .route('/webhook')
  .post(stripeWebhook); // No protect middleware for webhook

router
  .route('/')
  .get(protect, getPayments);

router
  .route('/:id')
  .get(protect, getPayment);

router
  .route('/:id')
  .put(protect, updatePayment); // Only admin can update

router
  .route('/:id/receipt')
  .get(protect, getPaymentReceipt);

module.exports = router;