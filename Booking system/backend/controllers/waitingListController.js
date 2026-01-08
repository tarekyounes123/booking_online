const { WaitingList, Service, User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Join waiting list
// @route     POST /api/waiting-list
// @access    Private
exports.joinWaitingList = asyncHandler(async (req, res, next) => {
    const { serviceId, date, preferredTime, notes } = req.body;

    const service = await Service.findByPk(serviceId);
    if (!service) {
        return next(new ErrorResponse(`Service not found with id of ${serviceId}`, 404));
    }

    // Check if already on waiting list for this service and date
    const existingEntry = await WaitingList.findOne({
        where: {
            userId: req.user.id,
            serviceId,
            date
        }
    });

    if (existingEntry) {
        return next(new ErrorResponse('You are already on the waiting list for this service on this date', 400));
    }

    const waitingListEntry = await WaitingList.create({
        userId: req.user.id,
        serviceId,
        date,
        preferredTime,
        notes,
        status: 'waiting'
    });

    res.status(201).json({
        success: true,
        data: waitingListEntry
    });
});

// @desc      Get waiting list (Admin) or User's waiting list
// @route     GET /api/waiting-list
// @access    Private
exports.getWaitingList = asyncHandler(async (req, res, next) => {
    let where = {};

    if (req.user.role !== 'admin') {
        where.userId = req.user.id;
    }

    const list = await WaitingList.findAll({
        where,
        include: [
            {
                model: Service,
                attributes: ['name', 'duration']
            },
            {
                model: User,
                attributes: ['firstName', 'lastName', 'email', 'phone']
            }
        ],
        order: [['date', 'ASC']]
    });

    res.status(200).json({
        success: true,
        count: list.length,
        data: list
    });
});

// @desc      Leave waiting list
// @route     DELETE /api/waiting-list/:id
// @access    Private
exports.leaveWaitingList = asyncHandler(async (req, res, next) => {
    const entry = await WaitingList.findByPk(req.params.id);

    if (!entry) {
        return next(new ErrorResponse(`Waiting list entry not found with id of ${req.params.id}`, 404));
    }

    // Authorization
    if (req.user.role !== 'admin' && entry.userId !== req.user.id) {
        return next(new ErrorResponse('Not authorized to remove this entry', 401));
    }

    await entry.destroy();

    res.status(200).json({
        success: true,
        data: {}
    });
});
