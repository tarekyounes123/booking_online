const { ThemeSetting } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get current theme settings
// @route     GET /api/theme
// @access    Public
exports.getTheme = asyncHandler(async (req, res, next) => {
    // Get the most recently updated active theme
    const theme = await ThemeSetting.findOne({
        where: { isActive: true },
        order: [['updatedAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        data: theme || {
            // Defaults if no theme found
            primaryColor: '#1976d2',
            secondaryColor: '#dc004e',
            fontFamily: 'Roboto, sans-serif',
            borderRadius: 4
        }
    });
});

// @desc      Update theme settings
// @route     PUT /api/theme
// @access    Private (Admin only)
exports.updateTheme = asyncHandler(async (req, res, next) => {
    const { primaryColor, secondaryColor, fontFamily, borderRadius } = req.body;

    // Find existing active theme or create new one
    let theme = await ThemeSetting.findOne({
        where: { isActive: true },
        order: [['updatedAt', 'DESC']]
    });

    if (theme) {
        theme = await theme.update({
            primaryColor,
            secondaryColor,
            fontFamily,
            borderRadius
        });
    } else {
        theme = await ThemeSetting.create({
            primaryColor,
            secondaryColor,
            fontFamily,
            borderRadius,
            isActive: true
        });
    }

    res.status(200).json({
        success: true,
        data: theme
    });
});
