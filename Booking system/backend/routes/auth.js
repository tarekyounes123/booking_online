const express = require('express');
const rateLimit = require('express-rate-limit');
const avatarUpload = require('../middleware/avatarUpload');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  verifyUser,
  resendVerification,
  verifyResetCode
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, validateRegister, validateLogin } = require('../middleware/validation');

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many registration attempts from this IP, please try again later.'
});

const router = express.Router();

router.post('/register', registerLimiter, validate(validateRegister), register);
router.post('/verify', verifyUser);
router.post('/resend-verification', resendVerification);
router.post('/login', validate(validateLogin), login);
router.post('/logout', logout);
router.post('/forgotpassword', validate([validateLogin[0]]), forgotPassword); // Only validate email
router.post('/verify-reset-code', verifyResetCode);
router.put('/resetpassword', validate([validateLogin[1]]), resetPassword); // OTP based reset
router.put('/updatedetails', protect, avatarUpload.single('avatar'), updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.get('/me', protect, getMe);

module.exports = router;