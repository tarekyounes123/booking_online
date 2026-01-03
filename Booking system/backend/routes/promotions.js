const express = require('express');
const {
  getPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromotion
} = require('../controllers/promotionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// This route is for users to validate a code
router.route('/validate').post(protect, validatePromotion);

// All routes below are for admins only
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getPromotions)
  .post(createPromotion);

router
  .route('/:id')
  .get(getPromotion)
  .put(updatePromotion)
  .delete(deletePromotion);

module.exports = router;
