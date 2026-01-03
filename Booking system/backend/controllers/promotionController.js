const { Promotion } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get all promotions
// @route     GET /api/promotions
// @access    Private/Admin
exports.getPromotions = asyncHandler(async (req, res, next) => {
  const promotions = await Promotion.findAll({
    order: [['endDate', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: promotions.length,
    data: promotions
  });
});

// @desc      Get a single promotion
// @route     GET /api/promotions/:id
// @access    Private/Admin
exports.getPromotion = asyncHandler(async (req, res, next) => {
  const promotion = await Promotion.findByPk(req.params.id);

  if (!promotion) {
    return next(
      new ErrorResponse(`Promotion not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: promotion
  });
});

// @desc      Create a new promotion
// @route     POST /api/promotions
// @access    Private/Admin
exports.createPromotion = asyncHandler(async (req, res, next) => {
  const { code, description, discountType, discountValue, startDate, endDate, usageLimit, isActive } = req.body;

  // Basic validation
  if (!code || !discountType || !discountValue || !startDate || !endDate || !usageLimit) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }
  
  const promotion = await Promotion.create(req.body);

  res.status(201).json({
    success: true,
    data: promotion
  });
});

// @desc      Update a promotion
// @route     PUT /api/promotions/:id
// @access    Private/Admin
exports.updatePromotion = asyncHandler(async (req, res, next) => {
  let promotion = await Promotion.findByPk(req.params.id);

  if (!promotion) {
    return next(
      new ErrorResponse(`Promotion not found with id of ${req.params.id}`, 404)
    );
  }

  promotion = await promotion.update(req.body);

  res.status(200).json({
    success: true,
    data: promotion
  });
});

// @desc      Delete a promotion
// @route     DELETE /api/promotions/:id
// @access    Private/Admin
exports.deletePromotion = asyncHandler(async (req, res, next) => {
  const promotion = await Promotion.findByPk(req.params.id);

  if (!promotion) {
    return next(
      new ErrorResponse(`Promotion not found with id of ${req.params.id}`, 404)
    );
  }

  await promotion.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Validate a promotion code
// @route     POST /api/promotions/validate
// @access    Private
exports.validatePromotion = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    return next(new ErrorResponse('Please provide a promotion code', 400));
  }

  const promotion = await Promotion.findOne({ where: { code } });

  if (!promotion) {
    return next(new ErrorResponse('Invalid promotion code', 404));
  }

  if (!promotion.isActive) {
    return next(new ErrorResponse('This promotion is no longer active', 400));
  }

  const now = new Date();
  if (now < promotion.startDate || now > promotion.endDate) {
    return next(new ErrorResponse('This promotion is not valid at this time', 400));
  }

  if (promotion.timesUsed >= promotion.usageLimit) {
    return next(new ErrorResponse('This promotion has reached its usage limit', 400));
  }

  res.status(200).json({
    success: true,
    data: promotion
  });
});
