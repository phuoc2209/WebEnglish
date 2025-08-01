const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const initModels = require('../models/init-models');
const Joi = require('joi');
require('dotenv').config();

const models = initModels(sequelize);


const { sendOtpEmail } = require('../controller/sendmailController');

const otpStorage = new Map(); // email -> { otp, expiresAt }

const register = async (req, res) => {
  console.log(req.body);
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + parseInt(process.env.OTP_EXPIRE_MINUTES) * 60 * 1000;

  otpStorage.set(email, { otp, expiresAt });

  try {
    await sendOtpEmail(email, otp);
    return res.status(200).json({ message: 'Mã xác thực đã được gửi qua email.' });
  } catch (error) {
    console.error('Lỗi gửi email:', error);
    return res.status(500).json({ message: 'Không thể gửi email xác thực.' });
  }
};

const verifyOtp = (req, res) => {
  console.log(req.body);
  const { email, otp } = req.body;

  const record = otpStorage.get(email);
  console.log(record);
  if (!record) {
    console.log(hello);
    return res.status(400).json({ message: 'Không tìm thấy mã OTP cho email này.' });

  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Mã OTP không chính xác.' });
  }

  if (Date.now() > record.expiresAt) {
    return res.status(400).json({ message: 'Mã OTP đã hết hạn.' });
  }

  otpStorage.delete(email); // Xác thực xong thì xóa

  return res.status(200).json({ message: 'Xác thực thành công!' });
};

// Gửi OTP cho quên mật khẩu
const forgotPasswordOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email là bắt buộc' });
  // Kiểm tra user tồn tại
  const user = await models.user.findOne({ where: { email } });
  if (!user) return res.status(200).json({ message: 'Nếu email tồn tại, mã OTP đã được gửi.' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + parseInt(process.env.OTP_EXPIRE_MINUTES) * 60 * 1000;
  otpStorage.set(`forgot_${email}`, { otp, expiresAt, verified: false });
  try {
    // Gửi email với nội dung riêng cho quên mật khẩu
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Mã xác thực đặt lại mật khẩu - Website học tiếng Anh',
      html: `
        <p>Xin chào,</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu. Mã xác thực của bạn là: <strong>${otp}</strong></p>
        <p>Mã có hiệu lực trong ${process.env.OTP_EXPIRE_MINUTES} phút.</p>
        <p>Nếu không phải bạn, hãy bỏ qua email này.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Mã OTP đã được gửi qua email.' });
  } catch (error) {
    console.error('Lỗi gửi email:', error);
    return res.status(500).json({ message: 'Không thể gửi email xác thực.' });
  }
};

// Xác thực OTP quên mật khẩu
const verifyForgotOtp = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStorage.get(`forgot_${email}`);
  if (!record) return res.status(400).json({ message: 'Không tìm thấy mã OTP cho email này.' });
  if (record.otp !== otp) return res.status(400).json({ message: 'Mã OTP không chính xác.' });
  if (Date.now() > record.expiresAt) return res.status(400).json({ message: 'Mã OTP đã hết hạn.' });
  // Đánh dấu đã xác thực OTP
  otpStorage.set(`forgot_${email}`, { ...record, verified: true });
  return res.status(200).json({ message: 'Xác thực OTP thành công!' });
};


// JOI validation schemas
const quizSchema = Joi.object({
  title: Joi.string().min(1).max(255).required().messages({
    'string.max': 'Tiêu đề không được vượt quá 255 ký tự',
    'any.required': 'Tiêu đề là bắt buộc',
  }),
  description: Joi.string().max(1000).allow('').optional().messages({
    'string.max': 'Mô tả không được vượt quá 1000 ký tự',
  }),
  time_limit: Joi.number().integer().min(1).optional().messages({
    'number.min': 'Thời gian giới hạn phải lớn hơn 0',
  }),
  is_public: Joi.boolean().optional(),
});

const questionSchema = Joi.object({
  question_text: Joi.string().min(1).max(1000).required().messages({
    'string.max': 'Câu hỏi không được vượt quá 1000 ký tự',
    'any.required': 'Câu hỏi là bắt buộc',
  }),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required().messages({
    'any.only': 'Độ khó phải là easy, medium hoặc hard',
  }),
  score: Joi.number().min(1).optional().messages({
    'number.min': 'Điểm phải lớn hơn 0',
  }),
});

const answerSchema = Joi.object({
  option_text: Joi.string().min(1).max(500).required().messages({
    'string.max': 'Câu trả lời không được vượt quá 500 ký tự',
    'any.required': 'Câu trả lời là bắt buộc',
  }),
  is_correct: Joi.boolean().required().messages({
    'any.required': 'Trạng thái đúng/sai là bắt buộc',
  }),
});

/**
 * Middleware xác thực với quyền cụ thể (hoặc không có yêu cầu quyền)
 * @param {'admin' | 'student' | null} requiredRole 
 * @returns 
 */
const authenticateWithRole = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({
          status: 'error',
          message: 'Thiếu header Authorization',
        });
      }
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(400).json({
          status: 'error',
          message: 'Định dạng token không hợp lệ: Yêu cầu Bearer token',
        });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(400).json({
          status: 'error',
          message: 'Token rỗng',
        });
      }

      if (!process.env.JWT_SECRET) {
        console.error(`[${new Date().toISOString()}] JWT_SECRET không được cấu hình`);
        return res.status(500).json({
          status: 'error',
          message: 'Lỗi server: Thiếu cấu hình bảo mật',
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded.user_id) {
        console.error(`[${new Date().toISOString()}] Token thiếu user_id: ${JSON.stringify(decoded)}`);
        return res.status(400).json({
          status: 'error',
          message: 'Token không hợp lệ: Thiếu user_id',
        });
      }

      const user = await models.user.findByPk(decoded.user_id, {
        attributes: ['user_id', 'username', 'email', 'role'],
      });
      if (!user) {
        console.error(`[${new Date().toISOString()}] User không tồn tại: user_id=${decoded.user_id}`);
        return res.status(401).json({
          status: 'error',
          message: 'Người dùng không tồn tại',
        });
      }

      if (requiredRole && user.role !== requiredRole) {
        console.warn(`[${new Date().toISOString()}] Quyền bị từ chối: user_id=${user.user_id}, role=${user.role}, required=${requiredRole}`);
        return res.status(403).json({
          status: 'error',
          message: `Yêu cầu quyền ${requiredRole}`,
        });
      }

      req.user = {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        email: user.email,
      };

      next();
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Middleware Auth error: ${error.stack}`);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token đã hết hạn',
        });
      }
      return res.status(401).json({
        status: 'error',
        message: 'Token không hợp lệ',
      });
    }
  };
};

// Middleware cụ thể
const authenticateToken = authenticateWithRole('admin');
const authenticateUser = authenticateWithRole();

// Middleware cũ để tương thích
const authMiddleware = authenticateUser;

// ================== CÁC HÀM KIỂM TRA QUYỀN FORUM (GỘP TỪ forumAuthService.js) ==================

/**
 * Lấy thông tin quyền forum của user
 * @param {number} userId - ID của user
 * @param {number} forumId - ID của forum
 * @returns {Object|null} - Thông tin quyền forum hoặc null
 */
const getUserForumRole = async (userId, forumId) => {
  forumId = Number(forumId);
  if (!forumId || isNaN(forumId)) {
    throw new Error('Invalid forumId');
  }
  try {
    const forumMember = await models.forummember.findOne({
      where: {
        user_id: userId,
        forum_id: forumId
      },
      attributes: ['member_id', 'role', 'is_banned', 'ban_reason', 'ban_expires_at']
    });
    return forumMember;
  } catch (error) {
    console.error('Error getting user forum role:', error);
    throw error;
  }
};

const isForumAdmin = async (userId, forumId) => {
  try {
    const forumMember = await getUserForumRole(userId, forumId);
    return forumMember && forumMember.role === 'admin' && !forumMember.is_banned;
  } catch (error) {
    console.error('Error checking forum admin:', error);
    return false;
  }
};

const isForumModerator = async (userId, forumId) => {
  try {
    const forumMember = await getUserForumRole(userId, forumId);
    return forumMember && forumMember.role === 'moderator' && !forumMember.is_banned;
  } catch (error) {
    console.error('Error checking forum moderator:', error);
    return false;
  }
};

const isForumAdminOrModerator = async (userId, forumId) => {
  try {
    const forumMember = await getUserForumRole(userId, forumId);
    return forumMember &&
      (forumMember.role === 'admin' || forumMember.role === 'moderator') &&
      !forumMember.is_banned;
  } catch (error) {
    console.error('Error checking forum admin or moderator:', error);
    return false;
  }
};

const isForumTeacher = async (userId, forumId) => {
  try {
    const forumMember = await getUserForumRole(userId, forumId);
    return forumMember && forumMember.role === 'teacher' && !forumMember.is_banned;
  } catch (error) {
    console.error('Error checking forum teacher:', error);
    return false;
  }
};

const isForumAdminModeratorOrTeacher = async (userId, forumId) => {
  try {
    const forumMember = await getUserForumRole(userId, forumId);
    return forumMember &&
      (forumMember.role === 'admin' || forumMember.role === 'moderator' || forumMember.role === 'teacher') &&
      !forumMember.is_banned;
  } catch (error) {
    console.error('Error checking forum admin, moderator or teacher:', error);
    return false;
  }
};

const isForumMember = async (userId, forumId) => {
  try {
    const forumMember = await getUserForumRole(userId, forumId);
    return forumMember && !forumMember.is_banned;
  } catch (error) {
    console.error('Error checking forum member:', error);
    return false;
  }
};

const getUserAllForumRoles = async (userId) => {
  try {
    const forumMembers = await models.forummember.findAll({
      where: {
        user_id: userId
      },
      include: [
        {
          model: models.forum,
          as: 'forum',
          attributes: ['forum_id', 'name', 'description']
        }
      ],
      attributes: ['member_id', 'role', 'is_banned', 'joined_at', 'karma_earned', 'posts_count', 'comments_count']
    });
    return forumMembers;
  } catch (error) {
    console.error('Error getting user all forum roles:', error);
    throw error;
  }
};

const checkCombinedPermission = async (user, forumId = null, requiredUserRole = null, requiredForumRole = null) => {
  try {
    if (requiredUserRole && user.role === requiredUserRole) {
      return {
        hasPermission: true,
        permissionType: 'user',
        role: user.role,
        message: `User có quyền ${user.role}`
      };
    }
    if (requiredForumRole && forumId) {
      const forumMember = await getUserForumRole(user.user_id, forumId);
      if (!forumMember) {
        return {
          hasPermission: false,
          permissionType: 'forum',
          message: 'Không phải thành viên của forum này'
        };
      }
      if (forumMember.is_banned) {
        return {
          hasPermission: false,
          permissionType: 'forum',
          message: 'Tài khoản đã bị cấm trong forum này'
        };
      }
      if (forumMember.role === requiredForumRole || (Array.isArray(requiredForumRole) && requiredForumRole.includes(forumMember.role))) {
        return {
          hasPermission: true,
          permissionType: 'forum',
          role: forumMember.role,
          message: `Forum member có quyền ${forumMember.role}`
        };
      }
      return {
        hasPermission: false,
        permissionType: 'forum',
        message: `Yêu cầu quyền forum: ${requiredForumRole}`
      };
    }
    return {
      hasPermission: false,
      message: 'Không đủ quyền truy cập'
    };
  } catch (error) {
    return {
      hasPermission: false,
      message: 'Lỗi kiểm tra quyền'
    };
  }
};

const checkCombinedPermissionFlexible = async (user, forumId = null, requiredUserRole = null, requiredForumRole = null) => {
  try {
    if (requiredUserRole && user.role === requiredUserRole) {
      return {
        hasPermission: true,
        permissionType: 'user',
        role: user.role,
        message: `User có quyền ${user.role}`
      };
    }
    if (requiredForumRole && forumId) {
      const forumMember = await getUserForumRole(user.user_id, forumId);
      if (!forumMember) {
        return {
          hasPermission: false,
          permissionType: 'forum',
          message: 'Không phải thành viên của forum này'
        };
      }
      if (forumMember.is_banned) {
        return {
          hasPermission: false,
          permissionType: 'forum',
          message: 'Tài khoản đã bị cấm trong forum này'
        };
      }
      if (
        (Array.isArray(requiredForumRole) && requiredForumRole.includes(forumMember.role)) ||
        forumMember.role === requiredForumRole
      ) {
        return {
          hasPermission: true,
          permissionType: 'forum',
          role: forumMember.role,
          message: `Forum member có quyền ${forumMember.role}`
        };
      }
      return {
        hasPermission: false,
        permissionType: 'forum',
        message: `Yêu cầu quyền forum: ${requiredForumRole}`
      };
    }
    return {
      hasPermission: false,
      message: 'Không đủ quyền truy cập'
    };
  } catch (error) {
    return {
      hasPermission: false,
      message: 'Lỗi kiểm tra quyền'
    };
  }
};

// JOI validator middleware
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    console.warn(`[${new Date().toISOString()}] Validation error: ${JSON.stringify(error.details)}`);
    return res.status(400).json({
      status: 'error',
      message: 'Dữ liệu không hợp lệ',
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

const validateQuiz = validate(quizSchema);
const validateQuestion = validate(questionSchema);
const validateAnswer = validate(answerSchema);

// Middleware kiểm tra quyền admin hoặc admin diễn đàn
const authenticateUserOrForumAdmin = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();
    const forumId = req.params.forumId || req.body.forumId;
    if (!forumId) {
      return res.status(400).json({ status: 'error', message: 'Thiếu forumId' });
    }
    const isAdmin = await isForumAdmin(req.user.user_id, forumId);
    if (isAdmin) return next();
    return res.status(403).json({ status: 'error', message: 'Yêu cầu quyền admin hoặc quản trị diễn đàn' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Lỗi xác thực quyền admin diễn đàn' });
  }
};

// Middleware kiểm tra quyền admin hoặc moderator diễn đàn
const authenticateUserOrForumModerator = async (req, res, next) => {
  try {
    if (req.user.role === 'moderator') return next();
    const forumId = req.params.forumId || req.body.forumId;
    if (!forumId) {
      return res.status(400).json({ status: 'error', message: 'Thiếu forumId' });
    }
    const isAdminOrMod = await isForumAdminOrModerator(req.user.user_id, forumId);
    if (isAdminOrMod) return next();
    return res.status(403).json({ status: 'error', message: 'Yêu cầu quyền admin hoặc moderator diễn đàn' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Lỗi xác thực quyền moderator diễn đàn' });
  }
};

// Export
module.exports = {
  authenticateUser,
  authenticateToken,
  authMiddleware, // Để tương thích với code cũ
  validateQuiz,
  validateQuestion,
  validateAnswer,
  authenticateUserOrForumAdmin,
  authenticateUserOrForumModerator,
  // Export toàn bộ các hàm tiện ích kiểm tra quyền forum
  getUserForumRole,
  isForumAdmin,
  isForumModerator,
  isForumAdminOrModerator,
  isForumTeacher,
  isForumAdminModeratorOrTeacher,
  isForumMember,
  getUserAllForumRoles,
  checkCombinedPermission,
  checkCombinedPermissionFlexible,
  register,
  verifyOtp,
  forgotPasswordOtp,
  verifyForgotOtp,
  otpStorage,
};