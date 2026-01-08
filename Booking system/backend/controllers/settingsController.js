const { Settings } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get all settings
// @route     GET /api/settings
// @access    Private/Admin
exports.getSettings = asyncHandler(async (req, res, next) => {
    // Only admin can access settings
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to access settings', 401));
    }

    const settings = await Settings.findAll({
        include: [{
            model: require('../models').User,
            as: 'UpdatedByUser',
            attributes: ['id', 'firstName', 'lastName', 'email']
        }],
        order: [['key', 'ASC']]
    });

    res.status(200).json({
        success: true,
        count: settings.length,
        data: settings
    });
});

// @desc      Get single setting by key
// @route     GET /api/settings/:key
// @access    Private/Admin
exports.getSetting = asyncHandler(async (req, res, next) => {
    // Only admin can access settings
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to access settings', 401));
    }

    const setting = await Settings.findByPk(req.params.key, {
        include: [{
            model: require('../models').User,
            as: 'UpdatedByUser',
            attributes: ['id', 'firstName', 'lastName', 'email']
        }]
    });

    if (!setting) {
        return next(new ErrorResponse(`Setting not found with key of ${req.params.key}`, 404));
    }

    res.status(200).json({
        success: true,
        data: setting
    });
});

// @desc      Update setting
// @route     PUT /api/settings/:key
// @access    Private/Admin
exports.updateSetting = asyncHandler(async (req, res, next) => {
    // Only admin can update settings
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to update settings', 401));
    }

    let setting = await Settings.findByPk(req.params.key);

    // Only allow updating value field
    const { value } = req.body;

    if (value === undefined) {
        return next(new ErrorResponse('Please provide a value to update', 400));
    }

    // Validate boolean values for specific settings
    if (req.params.key === 'loyaltyPointsEnabled') {
        if (value !== 'true' && value !== 'false') {
            return next(new ErrorResponse('Value must be "true" or "false"', 400));
        }
    }

    if (!setting) {
        // Create if not found
        setting = await Settings.create({
            key: req.params.key,
            value: String(value),
            updatedBy: req.user.id
        });
    } else {
        // Update if found
        setting = await setting.update({
            value: String(value),
            updatedBy: req.user.id
        });
    }

    // Reload with associations
    setting = await Settings.findByPk(req.params.key, {
        include: [{
            model: require('../models').User,
            as: 'UpdatedByUser',
            attributes: ['id', 'firstName', 'lastName', 'email']
        }]
    });

    res.status(200).json({
        success: true,
        data: setting
    });
});
