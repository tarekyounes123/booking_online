const { Settings } = require('../models');

/**
 * Check if loyalty points system is enabled
 * @returns {Promise<boolean>} True if enabled, false otherwise
 */
async function checkLoyaltyPointsEnabled() {
    try {
        const setting = await Settings.findByPk('loyaltyPointsEnabled');
        if (!setting) return true; // Default to enabled if not found
        return setting.value === 'true';
    } catch (error) {
        console.error('Error checking loyalty points setting:', error);
        // Default to true if there's an error reading the setting
        return true;
    }
}

/**
 * Award loyalty points to a user if the system is enabled
 * @param {Object} user - User object
 * @param {number} amount - Amount to calculate points from
 * @param {Object} transaction - Sequelize transaction object
 * @returns {Promise<number>} Points awarded (0 if disabled)
 */
async function awardLoyaltyPoints(user, amount, transaction) {
    const isEnabled = await checkLoyaltyPointsEnabled();

    if (!isEnabled) {
        console.log('[LOYALTY] Loyalty points system is disabled. Skipping points award.');
        return 0;
    }

    const pointsEarned = Math.floor(amount);

    if (pointsEarned > 0 && user) {
        await user.increment('loyaltyPoints', { by: pointsEarned, transaction });
        console.log(`[LOYALTY] Awarded ${pointsEarned} points to user ${user.id}`);
        return pointsEarned;
    }

    return 0;
}

module.exports = {
    checkLoyaltyPointsEnabled,
    awardLoyaltyPoints
};
