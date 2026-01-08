const { Payment, Appointment, User, Promotion, Service } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const webhookService = require('../utils/webhookService');
const { checkLoyaltyPointsEnabled } = require('../utils/loyaltyHelper');

// @desc      Apply promotion code to appointment
// @route     POST /api/payments/apply-promotion
// @access    Private
exports.applyPromotion = asyncHandler(async (req, res, next) => {
  const { appointmentId, promoCode } = req.body;
  const { Promotion, Service, sequelize } = require('../models');

  // 1. Get appointment and the service to determine the price
  const appointment = await Appointment.findByPk(appointmentId, {
    include: [{ model: Service, attributes: ['price'] }]
  });

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${appointmentId}`, 404));
  }
  if (req.user.role !== 'admin' && appointment.userId !== req.user.id) {
    return next(new ErrorResponse(`User not authorized for this appointment`, 401));
  }
  if (!appointment.Service) {
    return next(new ErrorResponse(`Service not found for this appointment`, 404));
  }

  const originalAmount = parseFloat(appointment.Service.price);
  let discountAmount = 0;
  let promotionId = null;
  let promotion = null;

  // 2. If a promo code is provided, validate it and apply the discount
  if (promoCode) {
    promotion = await Promotion.findOne({ where: { code: promoCode } });

    if (!promotion) {
      return next(new ErrorResponse('Invalid promotion code', 400));
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

    // Calculate discount
    if (promotion.discountType === 'percentage') {
      discountAmount = (originalAmount * promotion.discountValue) / 100;
    } else { // 'fixed'
      discountAmount = promotion.discountValue;
    }

    // Ensure discount doesn't exceed original amount
    if (discountAmount > originalAmount) {
      discountAmount = originalAmount; // Max discount is the full price
    }

    promotionId = promotion.id;
  }

  const finalAmount = originalAmount - discountAmount;

  // Use a transaction to ensure atomicity
  const t = await sequelize.transaction();

  try {
    // 3. If a promotion was used, increment its usage count
    if (promotion) {
      await promotion.increment('timesUsed', { by: 1, transaction: t });
    }

    // 4. Update the appointment with discount information
    await appointment.update({
      originalPrice: originalAmount,
      discountedPrice: finalAmount,
      discountAmount: discountAmount,
      promotionId: promotionId
    }, { transaction: t });

    // If everything is successful, commit the transaction
    await t.commit();

    // Return the calculated discount information
    res.status(200).json({
      success: true,
      originalAmount: originalAmount,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      promotionId: promotionId,
      promotionCode: promoCode
    });

  } catch (error) {
    // If anything fails, roll back the transaction
    await t.rollback();
    console.error('Error applying promotion:', error);
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Create payment for Lebanon methods (bank transfer, cash)
// @route     POST /api/payments/create
// @access    Private
exports.createPayment = asyncHandler(async (req, res, next) => {
  const { appointmentId, promoCode, paymentMethod = 'cash', currency = 'usd' } = req.body;
  const { Promotion, Service, sequelize } = require('../models');

  // 1. Get appointment and the service to determine the price
  const appointment = await Appointment.findByPk(appointmentId, {
    include: [{ model: Service, attributes: ['price'] }]
  });

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${appointmentId}`, 404));
  }
  if (req.user.role !== 'admin' && appointment.userId !== req.user.id) {
    return next(new ErrorResponse(`User not authorized for this appointment`, 401));
  }
  if (!appointment.Service) {
    return next(new ErrorResponse(`Service not found for this appointment`, 404));
  }

  const originalAmount = parseFloat(appointment.Service.price);
  let finalAmount = originalAmount;
  let discountAmount = 0;
  let promotionId = null;
  let promotion = null;

  // 2. If a promo code is provided, validate it and apply the discount
  if (promoCode) {
    promotion = await Promotion.findOne({ where: { code: promoCode } });

    if (!promotion) {
      return next(new ErrorResponse('Invalid promotion code', 400));
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

    // Calculate discount
    if (promotion.discountType === 'percentage') {
      discountAmount = (originalAmount * promotion.discountValue) / 100;
    } else { // 'fixed'
      discountAmount = promotion.discountValue;
    }

    finalAmount = originalAmount - discountAmount;
    if (finalAmount < 0) {
      finalAmount = 0; // Ensure price doesn't go below zero
    }

    promotionId = promotion.id;
  }

  // Use a transaction to ensure atomicity
  const t = await sequelize.transaction();

  try {
    // Create payment record in our database for Lebanon methods
    const payment = await Payment.create({
      appointmentId: appointmentId,
      userId: req.user.id,
      originalAmount: originalAmount,
      discountAmount: discountAmount,
      amount: finalAmount, // Final amount
      promotionId: promotionId,
      currency: currency,
      paymentMethod: paymentMethod, // Use the requested payment method
      paymentIntentId: null, // No payment intent for Lebanon methods
      status: paymentMethod === 'cash' ? 'completed' : 'pending', // Cash payments are completed immediately
      paidAt: paymentMethod === 'cash' ? new Date() : null // Set paidAt for cash payments
    }, { transaction: t });

    // 3. If a promotion was used, increment its usage count
    if (promotion) {
      await promotion.increment('timesUsed', { by: 1, transaction: t });
    }

    // 4. ADD POINTS LOYALTY Logic - ONLY IF COMPLETED
    if (payment.status === 'completed') {
      const user = await User.findByPk(req.user.id);
      const pointsEarned = await awardLoyaltyPoints(user, finalAmount, t);
      if (pointsEarned > 0) {
        await payment.update({ pointsAwarded: true }, { transaction: t });
      }
    }

    // If everything is successful, commit the transaction
    await t.commit();

    // --- Trigger Webhooks ---
    // Using setTimeout to trigger webhooks asynchronously without blocking the response
    setTimeout(async () => {
      try {
        // Get the payment details with related data
        const paymentDetails = await Payment.findByPk(payment.id, {
          include: [
            {
              model: Appointment,
              include: [
                { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Service, attributes: ['name', 'duration', 'price'] },
                {
                  model: require('../models').Staff,
                  include: [{ model: User, attributes: ['firstName', 'lastName'] }]
                }
              ]
            }
          ]
        });

        if (paymentDetails) {
          // Trigger webhook for payment completion
          await webhookService.triggerWebhooks('payment.completed', {
            payment: paymentDetails.toJSON(),
            timestamp: new Date().toISOString()
          });
          console.log(`Webhooks triggered for payment completion ${paymentDetails.id}`);
        }
      } catch (error) {
        console.error('Could not trigger webhooks for payment completion. Error:', error);
        // Do not block the response for this failure. The payment is already created.
      }
    }, 0);
    // --- End of Webhook Logic ---

    res.status(200).json({
      success: true,
      payment: payment
    });

  } catch (error) {
    // If anything fails, roll back the transaction
    await t.rollback();
    return next(new ErrorResponse(error.message, 500));
  }
});


// @desc      Get payment by ID
// @route     GET /api/payments/:id
// @access    Private
exports.getPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findByPk(req.params.id, {
    include: [
      {
        model: Appointment,
        include: [{
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }]
      }
    ]
  });

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  // Authorization check
  if (
    req.user.role !== 'admin' &&
    req.user.id !== payment.userId
  ) {
    return next(
      new ErrorResponse(
        `User not authorized to access this payment`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc      Get all payments
// @route     GET /api/payments
// @access    Private
exports.getPayments = asyncHandler(async (req, res, next) => {
  let payments;

  if (req.user.role === 'admin') {
    // Admin can see all payments
    payments = await Payment.findAll({
      include: [
        {
          model: Appointment,
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  } else {
    // Regular user can only see their own payments
    payments = await Payment.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Appointment,
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// @desc      Update payment status
// @route     PUT /api/payments/:id
// @access    Private/Admin
exports.updatePayment = asyncHandler(async (req, res, next) => {
  const allowedFields = ['status'];
  const updateData = {};

  // Only allow specific fields to be updated
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const payment = await Payment.findByPk(req.params.id);

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  // Only admin can update payment status
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User not authorized to update payment`,
        401
      )
    );
  }

  // Transaction for safe update
  const t = await require('../models').sequelize.transaction();

  try {
    const previousStatus = payment.status;

    // If status is being changed to 'completed', set paidAt timestamp
    if (updateData.status === 'completed' && previousStatus !== 'completed') {
      updateData.paidAt = new Date();
    }

    await payment.update(updateData, { transaction: t });

    // Check if status changed to 'completed' OR if it is completed but points weren't awarded yet
    if (payment.status === 'completed' && !payment.pointsAwarded) {
      const user = await User.findByPk(payment.userId);
      const pointsEarned = await awardLoyaltyPoints(user, payment.amount, t);
      if (pointsEarned > 0) {
        await payment.update({ pointsAwarded: true }, { transaction: t });
      }
    }

    await t.commit();

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    await t.rollback();
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Get payment receipt
// @route     GET /api/payments/:id/receipt
// @access    Private
exports.getPaymentReceipt = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findByPk(req.params.id, {
    include: [
      {
        model: Appointment,
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      }
    ]
  });

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  // Authorization check
  if (
    req.user.role !== 'admin' &&
    req.user.id !== payment.userId
  ) {
    return next(
      new ErrorResponse(
        `User not authorized to access this receipt`,
        401
      )
    );
  }

  // In a real application, you would generate a proper receipt document
  // For now, we'll return the payment data as a receipt
  const receipt = {
    id: payment.id,
    appointmentId: payment.appointmentId,
    userId: payment.userId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    paidAt: payment.paidAt,
    appointment: {
      date: payment.Appointment.date,
      startTime: payment.Appointment.startTime,
      endTime: payment.Appointment.endTime,
      service: payment.Appointment.Service ? payment.Appointment.Service.name : null,
      staff: payment.Appointment.Staff ?
        `${payment.Appointment.Staff.User.firstName} ${payment.Appointment.Staff.User.lastName}` : null
    },
    user: {
      name: `${payment.Appointment.User.firstName} ${payment.Appointment.User.lastName}`,
      email: payment.Appointment.User.email
    }
  };

  res.status(200).json({
    success: true,
    data: receipt
  });
});

// @desc      Redeem loyalty points for discount
// @route     POST /api/payments/redeem-points
// @access    Private
exports.redeemPoints = asyncHandler(async (req, res, next) => {
  const { appointmentId, pointsToRedeem } = req.body;

  if (!pointsToRedeem || pointsToRedeem <= 0) {
    return next(new ErrorResponse('Please provide valid points to redeem', 400));
  }

  const appointment = await Appointment.findByPk(appointmentId, {
    include: [{ model: Service, attributes: ['price'] }]
  });

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${appointmentId}`, 404));
  }

  // Verify ownership
  if (req.user.role !== 'admin' && appointment.userId !== req.user.id) {
    return next(new ErrorResponse(`User not authorized for this appointment`, 401));
  }

  const user = await User.findByPk(req.user.id);
  if (user.loyaltyPoints < pointsToRedeem) {
    return next(new ErrorResponse(`Insufficient loyalty points. You have ${user.loyaltyPoints}.`, 400));
  }

  const originalAmount = parseFloat(appointment.Service.price);

  // Logic: 10 points = $1 discount (Example)
  const discountAmount = pointsToRedeem / 10;

  if (discountAmount > originalAmount) {
    return next(new ErrorResponse(`Discount cannot exceed appointment price`, 400));
  }

  const finalAmount = originalAmount - discountAmount;

  // Transaction
  const t = await require('../models').sequelize.transaction();

  try {
    // Deduct points
    await user.decrement('loyaltyPoints', { by: pointsToRedeem, transaction: t });

    // Update appointment
    await appointment.update({
      originalPrice: originalAmount,
      discountedPrice: finalAmount,
      discountAmount: discountAmount,
      promotionId: null // Clear promo if any, assuming exclusive
    }, { transaction: t });

    await t.commit();

    res.status(200).json({
      success: true,
      originalAmount,
      discountAmount,
      finalAmount,
      pointsRedeemed: pointsToRedeem,
      remainingPoints: user.loyaltyPoints - pointsToRedeem
    });

  } catch (err) {
    await t.rollback();
    return next(new ErrorResponse('Redemption failed', 500));
  }
});