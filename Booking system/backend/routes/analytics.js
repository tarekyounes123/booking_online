const express = require('express');
const { 
  getFinancialAnalytics, 
  getPromotionAnalytics, 
  getAppointmentAnalytics 
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/financial')
  .get(protect, getFinancialAnalytics);

router
  .route('/promotions')
  .get(protect, getPromotionAnalytics);

router
  .route('/appointments')
  .get(protect, getAppointmentAnalytics);

module.exports = router;