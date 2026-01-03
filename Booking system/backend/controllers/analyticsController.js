const { Appointment, Service, Promotion, Payment, User } = require('../models');
const { Op } = require('sequelize');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get financial analytics with discount calculations
// @route     GET /api/analytics/financial
// @access    Private/Admin
exports.getFinancialAnalytics = asyncHandler(async (req, res, next) => {
  // Only allow admin access
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Access denied. Admin role required.', 403)
    );
  }

  // Get date range and status from query parameters (optional)
  const { startDate, endDate, status } = req.query;

  const whereClause = {};
  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) whereClause.date[Op.gte] = new Date(startDate);
    if (endDate) whereClause.date[Op.lte] = new Date(endDate);
  }

  // Only include completed appointments for revenue calculations by default
  // But allow override with status parameter
  if (status) {
    whereClause.status = status;
  } else {
    whereClause.status = 'completed'; // Default to completed for revenue
  }

  // Calculate total revenue metrics
  const appointments = await Appointment.findAll({
    where: whereClause,
    include: [
      {
        model: Service,
        attributes: ['price']
      },
      {
        model: Promotion,
        attributes: ['discountType', 'discountValue']
      }
    ]
  });

  let totalAppointments = appointments.length;
  let totalOriginalRevenue = 0;
  let totalDiscountAmount = 0;
  let totalDiscountedRevenue = 0;
  let totalAppointmentsWithDiscount = 0;

  appointments.forEach(appointment => {
    // Use the stored discounted price if available, otherwise calculate it
    const originalPrice = parseFloat(appointment.originalPrice || appointment.Service.price);
    const discountAmount = parseFloat(appointment.discountAmount || 0);
    const discountedPrice = parseFloat(appointment.discountedPrice || (originalPrice - discountAmount));

    totalOriginalRevenue += originalPrice;
    totalDiscountAmount += discountAmount;
    totalDiscountedRevenue += discountedPrice;

    if (discountAmount > 0) {
      totalAppointmentsWithDiscount++;
    }
  });

  // Calculate promotion usage analytics
  const promotionUsage = await Promotion.findAll({
    attributes: ['id', 'code', 'name', 'timesUsed', 'usageLimit', 'discountType', 'discountValue'],
    where: {
      isActive: true
    }
  });

  const analytics = {
    period: {
      startDate: startDate || 'Beginning of time',
      endDate: endDate || 'Present'
    },
    revenue: {
      totalOriginalRevenue: totalOriginalRevenue.toFixed(2),
      totalDiscountAmount: totalDiscountAmount.toFixed(2),
      totalDiscountedRevenue: totalDiscountedRevenue.toFixed(2),
      averageDiscountPerAppointment: totalAppointments > 0 ? (totalDiscountAmount / totalAppointments).toFixed(2) : '0.00',
      revenueLossFromDiscounts: totalOriginalRevenue - totalDiscountedRevenue
    },
    appointments: {
      totalAppointments,
      totalAppointmentsWithDiscount,
      discountRate: totalAppointments > 0 ? ((totalAppointmentsWithDiscount / totalAppointments) * 100).toFixed(2) : '0.00'
    },
    promotions: {
      totalPromotionsUsed: totalAppointmentsWithDiscount,
      promotionUsage
    }
  };

  res.status(200).json({
    success: true,
    data: analytics
  });
});

// @desc      Get promotion analytics
// @route     GET /api/analytics/promotions
// @access    Private/Admin
exports.getPromotionAnalytics = asyncHandler(async (req, res, next) => {
  // Only allow admin access
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Access denied. Admin role required.', 403)
    );
  }

  const promotions = await Promotion.findAll({
    include: [
      {
        model: Appointment,
        attributes: ['id', 'originalPrice', 'discountedPrice', 'discountAmount', 'date', 'status']
      }
    ]
  });

  const promotionAnalytics = promotions.map(promotion => {
    let totalDiscountAmount = 0;
    let totalOriginalRevenue = 0;
    let totalDiscountedRevenue = 0;
    let completedAppointments = 0;

    promotion.Appointments.forEach(appointment => {
      // Only count completed appointments for revenue calculations
      if (appointment.status === 'completed') {
        totalOriginalRevenue += parseFloat(appointment.originalPrice || 0);
        totalDiscountAmount += parseFloat(appointment.discountAmount || 0);
        totalDiscountedRevenue += parseFloat(appointment.discountedPrice || 0);
        completedAppointments++;
      }
    });

    return {
      id: promotion.id,
      code: promotion.code,
      name: promotion.name,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      timesUsed: promotion.timesUsed,
      usageLimit: promotion.usageLimit,
      usageRate: promotion.usageLimit > 0 ? ((promotion.timesUsed / promotion.usageLimit) * 100).toFixed(2) : '0.00',
      totalDiscountAmount: totalDiscountAmount.toFixed(2),
      totalOriginalRevenue: totalOriginalRevenue.toFixed(2),
      totalDiscountedRevenue: totalDiscountedRevenue.toFixed(2),
      appointments: promotion.Appointments.length,
      completedAppointments: completedAppointments
    };
  });

  res.status(200).json({
    success: true,
    data: promotionAnalytics
  });
});

// @desc      Get appointment analytics with discount breakdown
// @route     GET /api/analytics/appointments
// @access    Private/Admin
exports.getAppointmentAnalytics = asyncHandler(async (req, res, next) => {
  // Only allow admin access
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Access denied. Admin role required.', 403)
    );
  }

  const { startDate, endDate, withDiscount, status } = req.query;

  const whereClause = {};
  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) whereClause.date[Op.gte] = new Date(startDate);
    if (endDate) whereClause.date[Op.lte] = new Date(endDate);
  }

  if (withDiscount !== undefined) {
    if (withDiscount === 'true') {
      whereClause.discountAmount = { [Op.gt]: 0 };
    } else if (withDiscount === 'false') {
      whereClause.discountAmount = { [Op.eq]: 0 };
    }
  }

  if (status) {
    whereClause.status = status;
  }

  const appointments = await Appointment.findAll({
    where: whereClause,
    include: [
      {
        model: Service,
        attributes: ['name', 'price']
      },
      {
        model: User,
        attributes: ['firstName', 'lastName', 'email']
      },
      {
        model: Promotion,
        attributes: ['code', 'name']
      }
    ],
    order: [['date', 'DESC']]
  });

  const appointmentAnalytics = appointments.map(appointment => ({
    id: appointment.id,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
    service: appointment.Service ? appointment.Service.name : null,
    customer: appointment.User ? `${appointment.User.firstName} ${appointment.User.lastName}` : null,
    originalPrice: parseFloat(appointment.originalPrice || 0).toFixed(2),
    discountAmount: parseFloat(appointment.discountAmount || 0).toFixed(2),
    discountedPrice: parseFloat(appointment.discountedPrice || 0).toFixed(2),
    hasDiscount: parseFloat(appointment.discountAmount || 0) > 0,
    promotionCode: appointment.Promotion ? appointment.Promotion.code : null,
    paymentMethod: appointment.paymentMethod
  }));

  res.status(200).json({
    success: true,
    count: appointmentAnalytics.length,
    data: appointmentAnalytics
  });
});