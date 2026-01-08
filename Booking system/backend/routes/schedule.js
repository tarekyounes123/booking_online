const express = require('express');
const {
    getStoreHours,
    updateStoreHours,
    getStoreExceptions,
    createStoreException,
    updateStoreException,
    deleteStoreException
} = require('../controllers/scheduleController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
    .route('/hours')
    .get(getStoreHours)
    .put(protect, authorize('admin'), updateStoreHours);

router
    .route('/exceptions')
    .get(getStoreExceptions)
    .post(protect, authorize('admin'), createStoreException);

router
    .route('/exceptions/:id')
    .put(protect, authorize('admin'), updateStoreException)
    .delete(protect, authorize('admin'), deleteStoreException);

module.exports = router;
