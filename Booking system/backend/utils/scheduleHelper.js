const { StoreHour, StoreException } = require('../models');

/**
 * Check if the store is open at a specific date and time
 * @param {Date|string} date - Date to check (YYYY-MM-DD or Date object)
 * @param {string} time - Time to check (HH:mm:ss)
 * @returns {Promise<{isOpen: boolean, reason?: string, openTime?: string, closeTime?: string}>}
 */
/**
 * Get the store schedule for a specific date
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {Promise<{isOpen: boolean, reason?: string, openTime?: string, closeTime?: string}>}
 */
async function getStoreSchedule(dateStr) {
    // 1. Check for specific date exceptions
    const exception = await StoreException.findOne({
        where: { date: dateStr }
    });

    if (exception) {
        if (!exception.isOpen) {
            return {
                isOpen: false,
                reason: exception.reason || 'Store is closed for a special occasion.'
            };
        }
        return {
            isOpen: true,
            openTime: exception.openTime,
            closeTime: exception.closeTime,
            reason: exception.reason
        };
    }

    // 2. Fall back to standard weekly hours
    // Parse date manually to avoid timezone shifts with new Date(dateStr)
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0 (Sun) - 6 (Sat)

    const standardHour = await StoreHour.findOne({
        where: { dayOfWeek }
    });

    // If no standard hour is set, default to closed
    if (!standardHour || !standardHour.isOpen) {
        return {
            isOpen: false,
            reason: 'Store is closed on this day of the week.'
        };
    }

    return {
        isOpen: true,
        openTime: standardHour.openTime,
        closeTime: standardHour.closeTime
    };
}

/**
 * Check if the store is open at a specific date and time
 * @param {Date|string} date - Date to check (YYYY-MM-DD or Date object)
 * @param {string} time - Time to check (HH:mm:ss)
 * @returns {Promise<{isOpen: boolean, reason?: string, openTime?: string, closeTime?: string}>}
 */
async function isStoreOpen(date, time) {
    const checkDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const schedule = await getStoreSchedule(checkDate);

    if (!schedule.isOpen) {
        return schedule;
    }

    // Normalize time to HH:mm:ss if it's HH:mm
    let checkTime = time;
    if (checkTime && checkTime.length === 5) {
        checkTime = `${checkTime}:00`;
    }

    // Check if time is within open hours
    if (schedule.openTime && schedule.closeTime) {
        if (checkTime < schedule.openTime || checkTime >= schedule.closeTime) {
            return {
                isOpen: false,
                reason: `Outside of working hours (${schedule.openTime.substring(0, 5)} - ${schedule.closeTime.substring(0, 5)})`,
                openTime: schedule.openTime,
                closeTime: schedule.closeTime
            };
        }
    }

    return schedule;
}

module.exports = {
    isStoreOpen,
    getStoreSchedule
};
