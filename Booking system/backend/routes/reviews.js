const express = require('express');
const {
  getReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/:id')
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;