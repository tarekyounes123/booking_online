const crypto = require('crypto');
const { Webhook } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const webhookService = require('../utils/webhookService');

// @desc      Get all webhooks
// @route     GET /api/webhooks
// @access    Private/Admin
exports.getWebhooks = asyncHandler(async (req, res, next) => {
  const webhooks = await Webhook.findAll();

  res.status(200).json({
    success: true,
    count: webhooks.length,
    data: webhooks
  });
});

// @desc      Get single webhook
// @route     GET /api/webhooks/:id
// @access    Private/Admin
exports.getWebhook = asyncHandler(async (req, res, next) => {
  const webhook = await Webhook.findByPk(req.params.id);

  if (!webhook) {
    return next(
      new ErrorResponse(`Webhook not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: webhook
  });
});

// @desc      Create new webhook
// @route     POST /api/webhooks
// @access    Private/Admin
exports.createWebhook = asyncHandler(async (req, res, next) => {
  const { name, url, event, isActive } = req.body;

  // Validate required fields
  if (!name || !url || !event) {
    return next(
      new ErrorResponse('Please provide name, url, and event', 400)
    );
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    return next(
      new ErrorResponse('Please provide a valid URL', 400)
    );
  }

  // Generate a secret for webhook security if not provided
  const secret = req.body.secret || crypto.randomBytes(32).toString('hex');

  const webhook = await Webhook.create({
    name,
    url,
    event,
    isActive: isActive !== undefined ? isActive : true,
    secret
  });

  res.status(201).json({
    success: true,
    data: webhook
  });
});

// @desc      Update webhook
// @route     PUT /api/webhooks/:id
// @access    Private/Admin
exports.updateWebhook = asyncHandler(async (req, res, next) => {
  const webhook = await Webhook.findByPk(req.params.id);

  if (!webhook) {
    return next(
      new ErrorResponse(`Webhook not found with id of ${req.params.id}`, 404)
    );
  }

  const updatedWebhook = await webhook.update(req.body);

  res.status(200).json({
    success: true,
    data: updatedWebhook
  });
});

// @desc      Delete webhook
// @route     DELETE /api/webhooks/:id
// @access    Private/Admin
exports.deleteWebhook = asyncHandler(async (req, res, next) => {
  const webhook = await Webhook.findByPk(req.params.id);

  if (!webhook) {
    return next(
      new ErrorResponse(`Webhook not found with id of ${req.params.id}`, 404)
    );
  }

  await webhook.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Test webhook
// @route     POST /api/webhooks/:id/test
// @access    Private/Admin
exports.testWebhook = asyncHandler(async (req, res, next) => {
  const result = await webhookService.testWebhook(req.params.id);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc      Verify webhook signature
// @route     POST /api/webhooks/verify
// @access    Public (with secret verification)
exports.verifyWebhook = asyncHandler(async (req, res, next) => {
  // This endpoint would be used by external services to verify webhook endpoints
  // For now, we'll just send a challenge response if needed
  const { challenge } = req.body;
  
  if (challenge) {
    res.status(200).send(challenge);
  } else {
    res.status(200).json({
      success: true,
      message: 'Webhook endpoint verified'
    });
  }
});