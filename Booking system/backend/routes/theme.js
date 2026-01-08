const express = require('express');
const {
    getTheme,
    updateTheme
} = require('../controllers/themeController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(getTheme)
    .put(protect, authorize('admin'), updateTheme);

module.exports = router;
