const express = require('express');
const {
  getStaff,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffAppointments,
  getStaffByBranch
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getStaff)
  .post(protect, authorize('admin'), createStaff);

router
  .route('/:id')
  .get(getStaffMember)
  .put(protect, authorize('admin'), updateStaff)
  .delete(protect, authorize('admin'), deleteStaff);

router
  .route('/:id/appointments')
  .get(protect, getStaffAppointments);

router
  .route('/branch/:branchId')
  .get(getStaffByBranch);

module.exports = router;