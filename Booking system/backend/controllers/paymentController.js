const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const { Payment, Appointment, User, Promotion, Service } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Create payment intent
// @route     POST /api/payments/create-intent
// @access    Private
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { appointmentId, promoCode, currency = 'usd' } = req.body;
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

  // Check if the appointment is set for cash payment method
  if (appointment.paymentMethod === 'cash') {
    return next(new ErrorResponse(`This appointment is set for cash payment. No online payment is required.`, 400));
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
    // 3. Create Stripe payment intent with the final amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100), // Convert to cents
      currency: currency,
      metadata: {
        appointmentId: appointmentId,
        userId: req.user.id,
        promotionId: promotionId,
      }
    });

    // 4. Create payment record in our database
    const payment = await Payment.create({
      appointmentId: appointmentId,
      userId: req.user.id,
      originalAmount: originalAmount,
      discountAmount: discountAmount,
      amount: finalAmount, // Final amount
      promotionId: promotionId,
      currency: currency,
      paymentMethod: 'stripe',
      paymentIntentId: paymentIntent.id,
      status: 'pending'
    }, { transaction: t });

    // 5. If a promotion was used, increment its usage count
    if (promotion) {
      await promotion.increment('timesUsed', { by: 1, transaction: t });
    }

    // If everything is successful, commit the transaction
    await t.commit();

    res.status(200).json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment: payment
    });

  } catch (error) {
    // If anything fails, roll back the transaction
    await t.rollback();
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Handle Stripe webhook
// @route     POST /api/payments/webhook
// @access    Public (handled by Stripe)
exports.stripeWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Update payment status in database
      await Payment.update(
        { 
          status: 'completed', 
          paidAt: new Date(),
          transactionId: paymentIntent.id
        },
        { 
          where: { paymentIntentId: paymentIntent.id } 
        }
      );
      
      // Update appointment status to confirmed
      const payment = await Payment.findOne({
        where: { paymentIntentId: paymentIntent.id }
      });
      
      if (payment) {
        await Appointment.update(
          { status: 'confirmed' },
          { where: { id: payment.appointmentId } }
        );
      }
      
      break;
      
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      
      // Update payment status in database
      await Payment.update(
        { status: 'failed' },
        { where: { paymentIntentId: failedIntent.id } }
      );
      
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
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

  await payment.update(updateData);

  res.status(200).json({
    success: true,
    data: payment
  });
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