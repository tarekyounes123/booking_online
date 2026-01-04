const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const {
  getWebhooks,
  getWebhook,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  verifyWebhook
} = require('../controllers/webhookController');

const router = express.Router();

// @desc      Get all webhooks
// @route     GET /api/webhooks
// @access    Private/Admin
router.route('/')
  .get(protect, authorize('admin'), getWebhooks)
  .post(protect, authorize('admin'), createWebhook);

// @desc      Get, update, delete single webhook
// @route     GET|PUT|DELETE /api/webhooks/:id
// @access    Private/Admin
router.route('/:id')
  .get(protect, authorize('admin'), getWebhook)
  .put(protect, authorize('admin'), updateWebhook)
  .delete(protect, authorize('admin'), deleteWebhook);

// @desc      Test webhook
// @route     POST /api/webhooks/:id/test
// @access    Private/Admin
router.route('/:id/test')
  .post(protect, authorize('admin'), testWebhook);

// @desc      Verify webhook endpoint
// @route     POST /api/webhooks/verify
// @access    Public
router.route('/verify')
  .post(verifyWebhook);

module.exports = router;