const express = require('express');
const router = express.Router();
const { register, verifyOtp, forgotPasswordOtp, verifyForgotOtp } = require('../middlewares/authMiddleware')

router.post('/register', register);       // Gửi email OTP
router.post('/verify-otp', verifyOtp);    // Xác thực OTP

// Quên mật khẩu bằng OTP
router.post('/forgot-password-otp', forgotPasswordOtp);
router.post('/verify-forgot-otp', verifyForgotOtp);

module.exports = router;
