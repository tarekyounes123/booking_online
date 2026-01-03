const express = require('express');
const upload = require('../middleware/upload');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByBranch
} = require('../controllers/serviceController');
const {
  getServiceReviews,
  addReview
} = require('../controllers/reviewController'); // Import reviewController
const { protect, authorize } = require('../middleware/auth');
const { validate, validateService } = require('../middleware/validation');

const router = express.Router();

// Re-route into other resource routers
router
  .route('/:serviceId/reviews')
  .get(getServiceReviews)
  .post(protect, addReview);

router
  .route('/')
  .get(getServices)
  .post(protect, authorize('admin'), upload.single('image'), createService);

router
  .route('/:id')
  .get(getService)
  .put(protect, authorize('admin'), upload.single('image'), updateService)
  .delete(protect, authorize('admin'), deleteService);

router
  .route('/branch/:branchId')
  .get(getServicesByBranch);

module.exports = router;