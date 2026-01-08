const { ThemeSetting } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get current theme settings
// @route     GET /api/theme
// @access    Public
exports.getTheme = asyncHandler(async (req, res, next) => {
    // Get the first (and typically only) theme settings record
    let themeSettings = await ThemeSetting.findOne();

    // If no record exists, create one with defaults
    if (!themeSettings) {
        themeSettings = await ThemeSetting.create({
            primaryColor: '#1976d2',
            secondaryColor: '#dc004e',
            fontFamily: 'Roboto, sans-serif',
            borderRadius: 4,
            brandName: 'SARA',
            brandNameHighlight: 'Salon',
            isActive: true
        });
    }

    // Extract the settings from the model instance
    const settings = {
        primaryColor: themeSettings.primaryColor,
        secondaryColor: themeSettings.secondaryColor,
        fontFamily: themeSettings.fontFamily,
        borderRadius: themeSettings.borderRadius.toString(), // Ensure this is a string to match DB storage
        brandName: themeSettings.brandName,
        brandNameHighlight: themeSettings.brandNameHighlight
    };

    res.status(200).json({
        success: true,
        data: settings
    });
});

// @desc      Update theme settings
// @route     PUT /api/theme
// @access    Private (Admin only)
exports.updateTheme = asyncHandler(async (req, res, next) => {
    // Only allow admin to update theme settings
    if (req.user.role !== 'admin') {
      return next(
        new ErrorResponse('Access denied. Admin role required.', 403)
      );
    }

    const themeSettings = req.body; // Expects an object with theme settings

    // Get the first (and typically only) theme settings record
    let existingSettings = await ThemeSetting.findOne();

    if (!existingSettings) {
        // If no record exists, create one
        existingSettings = await ThemeSetting.create({
            primaryColor: '#1976d2',
            secondaryColor: '#dc004e',
            fontFamily: 'Roboto, sans-serif',
            borderRadius: 4,
            brandName: 'SARA',
            brandNameHighlight: 'Salon',
            isActive: true
        });
    }

    // Prepare update data, only update fields that are provided
    const updateData = {};
    if (themeSettings.primaryColor !== undefined) updateData.primaryColor = themeSettings.primaryColor;
    if (themeSettings.secondaryColor !== undefined) updateData.secondaryColor = themeSettings.secondaryColor;
    if (themeSettings.fontFamily !== undefined) updateData.fontFamily = themeSettings.fontFamily;
    if (themeSettings.borderRadius !== undefined) updateData.borderRadius = parseInt(themeSettings.borderRadius);
    if (themeSettings.brandName !== undefined) updateData.brandName = themeSettings.brandName;
    if (themeSettings.brandNameHighlight !== undefined) updateData.brandNameHighlight = themeSettings.brandNameHighlight;

    // Update the existing record
    await ThemeSetting.update(updateData, {
        where: { id: existingSettings.id }
    });

    // Fetch the updated settings to return
    const updatedSettings = await ThemeSetting.findByPk(existingSettings.id);

    const settings = {
        primaryColor: updatedSettings.primaryColor,
        secondaryColor: updatedSettings.secondaryColor,
        fontFamily: updatedSettings.fontFamily,
        borderRadius: updatedSettings.borderRadius.toString(),
        brandName: updatedSettings.brandName,
        brandNameHighlight: updatedSettings.brandNameHighlight
    };

    res.status(200).json({
        success: true,
        data: settings
    });
});
