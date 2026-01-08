const express = require('express');
const {
    getSettings,
    getSetting,
    updateSetting
} = require('../controllers/settingsController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getSettings);

router.route('/:key')
    .get(getSetting)
    .put(updateSetting);

module.exports = router;
