const express = require("express");
const AuthController = require("../controller/authController");
const { authenticateUser } = require('../middlewares/authMiddleware');
const initModels = require("../models/init-models");
const sequelize = require("../config/database");
const models = initModels(sequelize);

const router = express.Router();

/**
 * Router quản lý các API xác thực trên website học tiếng Anh
 */

/**
 * Middleware validation cho đăng ký người dùng
 */
const validateCreateUser = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      status: { success: false, message: "Username, email và password là bắt buộc" },
      data: null
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      status: { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" },
      data: null
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: { success: false, message: "Email không hợp lệ" },
      data: null
    });
  }

  next();
};

// POST /api/auth/login - Đăng nhập
router.post('/login', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Yêu cầu đăng nhập - Email: ${req.body.email}`);
    const result = await AuthController.login(req.body);
    return res.status(result.status.success ? 200 : 400).json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /api/auth/login:`, {
      message: error.message,
      stack: error.stack,
      email: req.body.email
    });
    return res.status(500).json({
      status: { success: false, message: "Lỗi server khi xử lý đăng nhập" },
      data: null
    });
  }
});

// POST /api/auth/register - Đăng ký tài khoản
router.post("/register", validateCreateUser, async (req, res) => {
  try {
    const userData = req.body;
    const result = await AuthController.register(userData);
    return res.status(result.status.success ? 201 : 400).json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /api/auth/register:`, {
      message: error.message,
      stack: error.stack,
      email: userData.email
    });
    return res.status(500).json({
      status: { success: false, message: "Lỗi server khi đăng ký tài khoản" },
      data: null
    });
  }
});

// GET /api/auth/me - Lấy thông tin người dùng hiện tại
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await models.user.findByPk(req.user.user_id, {
      attributes: ['user_id', 'username', 'email', 'role', 'created_at']
    });
    if (!user) {
      return res.status(404).json({
        status: { success: false, message: "Người dùng không tồn tại" },
        data: null
      });
    }
    return res.status(200).json({
      status: { success: true, message: "Lấy thông tin người dùng thành công" },
      data: JSON.stringify(user.toJSON())
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /api/auth/me:`, {
      message: error.message,
      stack: error.stack,
      userId: req.user.user_id
    });
    return res.status(500).json({
      status: { success: false, message: "Lỗi server khi lấy thông tin người dùng" },
      data: null
    });
  }
});

// POST /api/auth/forgot-password - Gửi email đặt lại mật khẩu
router.post('/forgot-password', (req, res) => AuthController.forgotPassword(req, res));

// PUT /api/auth/reset-password/:token - Đặt lại mật khẩu mới
router.put('/reset-password/:token', (req, res) => AuthController.resetPassword(req, res));

// Đặt lại mật khẩu mới bằng OTP (quên mật khẩu)
router.post('/update-password-by-otp', (req, res) => AuthController.updatePasswordByOtp(req, res));

module.exports = router;