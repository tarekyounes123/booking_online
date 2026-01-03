const express = require('express');
const {
  applyPromotion,
  getPayment,
  getPayments,
  updatePayment,
  getPaymentReceipt
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { validate, validatePayment } = require('../middleware/validation');

const router = express.Router();

router
  .route('/apply-promotion')
  .post(protect, validate(validatePayment), applyPromotion);


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