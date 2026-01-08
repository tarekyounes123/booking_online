const { StoreHour, StoreException } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get standard store hours
// @route     GET /api/schedule/hours
// @access    Public
exports.getStoreHours = asyncHandler(async (req, res, next) => {
    const hours = await StoreHour.findAll({
        order: [['dayOfWeek', 'ASC']]
    });

    res.status(200).json({
        success: true,
        count: hours.length,
        data: hours
    });
});

// @desc      Update standard store hours
// @route     PUT /api/schedule/hours
// @access    Private/Admin
exports.updateStoreHours = asyncHandler(async (req, res, next) => {
    const { hours } = req.body; // Array of { dayOfWeek, openTime, closeTime, isOpen }

    if (!Array.isArray(hours)) {
        return next(new ErrorResponse('Please provide an array of hours', 400));
    }

    const updatedHours = [];

    for (const hour of hours) {
        const { dayOfWeek, openTime, closeTime, isOpen } = hour;

        let record = await StoreHour.findOne({ where: { dayOfWeek } });

        if (record) {
            record = await record.update({ openTime, closeTime, isOpen });
        } else {
            record = await StoreHour.create({ dayOfWeek, openTime, closeTime, isOpen });
        }
        updatedHours.push(record);
    }

    res.status(200).json({
        success: true,
        data: updatedHours
    });
});

// @desc      Get store exceptions
// @route     GET /api/schedule/exceptions
// @access    Public
exports.getStoreExceptions = asyncHandler(async (req, res, next) => {
    const exceptions = await StoreException.findAll({
        order: [['date', 'ASC']]
    });

    res.status(200).json({
        success: true,
        count: exceptions.length,
        data: exceptions
    });
});

// @desc      Create store exception
// @route     POST /api/schedule/exceptions
// @access    Private/Admin
exports.createStoreException = asyncHandler(async (req, res, next) => {
    const { date, openTime, closeTime, isOpen, reason } = req.body;

    const exception = await StoreException.create({
        date,
        openTime,
        closeTime,
        isOpen,
        reason
    });

    res.status(201).json({
        success: true,
        data: exception
    });
});

// @desc      Update store exception
// @route     PUT /api/schedule/exceptions/:id
// @access    Private/Admin
exports.updateStoreException = asyncHandler(async (req, res, next) => {
    let exception = await StoreException.findByPk(req.params.id);

    if (!exception) {
        return next(new ErrorResponse(`Exception not found with id of ${req.params.id}`, 404));
    }

    exception = await exception.update(req.body);

    res.status(200).json({
        success: true,
        data: exception
    });
});

// @desc      Delete store exception
// @route     DELETE /api/schedule/exceptions/:id
// @access    Private/Admin
exports.deleteStoreException = asyncHandler(async (req, res, next) => {
    const exception = await StoreException.findByPk(req.params.id);

    if (!exception) {
        return next(new ErrorResponse(`Exception not found with id of ${req.params.id}`, 404));
    }

    await exception.destroy();

    res.status(200).json({
        success: true,
        data: {}
    });
});
