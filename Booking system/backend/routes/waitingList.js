const express = require('express');
const {
    joinWaitingList,
    getWaitingList,
    leaveWaitingList
} = require('../controllers/waitingListController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .post(joinWaitingList)
    .get(getWaitingList);

router
    .route('/:id')
    .delete(leaveWaitingList);

module.exports = router;
