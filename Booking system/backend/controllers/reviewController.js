const { Review, Service, User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get all reviews for a service
// @route     GET /api/services/:serviceId/reviews
// @access    Public
exports.getServiceReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.findAll({
    where: { serviceId: req.params.serviceId },
    include: [{
      model: User,
      as: 'user', // Use the alias defined in the Review model association
      attributes: ['firstName', 'lastName']
    }]
  });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc      Get single review
// @route     GET /api/reviews/:id
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id, {
    include: [{
      model: User,
      attributes: ['firstName', 'lastName']
    }]
  });

  if (!review) {
    return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc      Add review
// @route     POST /api/services/:serviceId/reviews
// @access    Private (User)
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.serviceId = req.params.serviceId;
  req.body.userId = req.user.id; // req.user is set by the protect middleware

  const { rating, comment, serviceId, userId } = req.body;

  // Check if service exists
  const service = await Service.findByPk(serviceId);

  if (!service) {
    return next(
      new ErrorResponse(`No service with the id of ${serviceId}`, 404)
    );
  }

  // Check if user already reviewed this service
  const existingReview = await Review.findOne({
    where: {
      userId,
      serviceId
    }
  });

  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this service', 400));
  }

  const review = await Review.create({
    rating,
    comment,
    serviceId,
    userId
  });

  // Update average rating and number of reviews for the service
  await service.update({
    averageRating: ((service.averageRating * service.numOfReviews) + rating) / (service.numOfReviews + 1),
    numOfReviews: service.numOfReviews + 1
  });

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc      Update review
// @route     PUT /api/reviews/:id
// @access    Private (User)
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findByPk(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404));
  }

  // Make sure user is review owner
  if (review.userId !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this review`, 401));
  }

  const oldRating = review.rating;

  review = await review.update(req.body);

  // Update average rating and number of reviews for the service
  const service = await Service.findByPk(review.serviceId);
  await service.update({
    averageRating: ((service.averageRating * service.numOfReviews) - oldRating + review.rating) / service.numOfReviews
  });

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc      Delete review
// @route     DELETE /api/reviews/:id
// @access    Private (User)
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404));
  }

  // Make sure user is review owner
  if (review.userId !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete this review`, 401));
  }

  await review.destroy();

  // Update average rating and number of reviews for the service
  const service = await Service.findByPk(review.serviceId);
  const newNumOfReviews = service.numOfReviews - 1;
  const newAverageRating = newNumOfReviews === 0 ? 0 : ((service.averageRating * service.numOfReviews) - review.rating) / newNumOfReviews;

  await service.update({
    averageRating: newAverageRating,
    numOfReviews: newNumOfReviews
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});