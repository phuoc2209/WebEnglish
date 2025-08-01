const bcrypt = require("bcrypt");
const sequelize = require("../config/database");
const jwt = require('jsonwebtoken');
const initModels = require("../models/init-models");
const models = initModels(sequelize);
const nodemailer = require('nodemailer');

/**
 * Controller quản lý xác thực người dùng trên website học tiếng Anh
 */
class AuthController {
  /**
   * Đăng nhập người dùng
   * @param {Object} credentials - Thông tin đăng nhập
   * @param {string} credentials.email - Email người dùng
   * @param {string} credentials.password - Mật khẩu người dùng
   * @returns {Promise<Object>} - Token và thông tin người dùng
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async login({ email, password }) {
    try {
      if (!email || !password) {
        throw new Error("Email và mật khẩu là bắt buộc");
      }

      const user = await models.user.findOne({ where: { email } });
      if (!user) {
        console.log(`[${new Date().toISOString()}] Không tìm thấy người dùng với email: ${email}`);
        throw new Error("Email hoặc mật khẩu không đúng");
      }
      console.log(`[${new Date().toISOString()}] Tìm thấy người dùng:`, {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        is_locked: user.is_locked
      });

      // Kiểm tra tài khoản có bị khóa không
      if (user.is_locked) {
        console.log(`[${new Date().toISOString()}] Tài khoản bị khóa cho email: ${email}`);
        throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ.");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log(`[${new Date().toISOString()}] Mật khẩu không khớp cho email: ${email}`);
        throw new Error("Email hoặc mật khẩu không đúng");
      }

      const token = jwt.sign(
        { user_id: user.user_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return {
        status: { success: true, message: "Đăng nhập thành công" },
        data: JSON.stringify({
          user: {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at
          },
          token
        })
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in authController.login:`, {
        message: error.message,
        stack: error.stack,
        email
      });
      return {
        status: { success: false, message: error.message },
        data: null
      };
    }
  }

  /**
   * Đăng ký người dùng mới
   * @param {Object} userData - Thông tin người dùng
   * @param {string} userData.username - Tên người dùng
   * @param {string} userData.email - Email người dùng
   * @param {string} userData.password - Mật khẩu người dùng
   * @param {string} [userData.role='student'] - Vai trò người dùng
   * @returns {Promise<Object>} - Thông tin người dùng mới
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async register(userData) {
    const transaction = await sequelize.transaction();
    try {
      const { username, email, password, role = 'student' } = userData;

      if (!username || !email || !password) {
        throw new Error("Thiếu thông tin bắt buộc: username, email và password");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Email không hợp lệ");
      }

      if (password.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
      }

      const existingUsername = await models.user.findOne({ where: { username }, transaction });
      if (existingUsername) {
        throw new Error("Username đã được sử dụng");
      }

      const existingEmail = await models.user.findOne({ where: { email }, transaction });
      if (existingEmail) {
        throw new Error("Email đã được sử dụng");
      }

      const validRoles = ['student', 'admin'];
      if (!validRoles.includes(role)) {
        throw new Error("Vai trò không hợp lệ, chỉ chấp nhận 'student' hoặc 'admin'");
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = await models.user.create({
        username,
        email,
        password: hashedPassword,
        created_at: new Date(),
        role
      }, { transaction });

      await transaction.commit();

      return {
        status: { success: true, message: "Đăng ký thành công" },
        data: JSON.stringify({
          user_id: newUser.user_id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          created_at: newUser.created_at
        })
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`[${new Date().toISOString()}] Error in authController.register:`, {
        message: error.message,
        stack: error.stack,
        email: userData.email
      });
      return {
        status: { success: false, message: error.message },
        data: null
      };
    }
  }

  /**
   * Đổi mật khẩu người dùng
   * @param {number} userId - ID người dùng
   * @param {Object} passwordData - Dữ liệu mật khẩu
   * @param {string} passwordData.currentPassword - Mật khẩu hiện tại
   * @param {string} passwordData.newPassword - Mật khẩu mới
   * @returns {Promise<Object>} - Kết quả đổi mật khẩu
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async changePassword(userId, passwordData) {
    const transaction = await sequelize.transaction();
    try {
      const { currentPassword, newPassword } = passwordData;

      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!currentPassword || !newPassword) throw new Error("Mật khẩu hiện tại và mật khẩu mới là bắt buộc");
      if (newPassword.length < 6) throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");

      const user = await models.user.findByPk(userId, { transaction });
      if (!user) throw new Error("Người dùng không tồn tại");

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) throw new Error("Mật khẩu hiện tại không đúng");

      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      await models.user.update(
        { password: hashedNewPassword },
        { where: { user_id: userId }, transaction }
      );

      await transaction.commit();
      return {
        status: { success: true, message: "Đổi mật khẩu thành công" },
        data: null
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`[${new Date().toISOString()}] Error in authController.changePassword:`, {
        message: error.message,
        stack: error.stack,
        userId
      });
      return {
        status: { success: false, message: error.message },
        data: null
      };
    }
  }

  /**
   * Gửi email đặt lại mật khẩu
   * @param {string} email
   * @returns {Promise<Object>}
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ status: { success: false, message: 'Email là bắt buộc' }, data: null });
      }
      const user = await models.user.findOne({ where: { email } });
      if (!user) {
        // Không tiết lộ email tồn tại hay không
        return res.status(200).json({ status: { success: true, message: 'Nếu email tồn tại, hướng dẫn đã được gửi.' }, data: null });
      }
      // Tạo token reset password (JWT, 30 phút)
      const resetToken = jwt.sign(
        { user_id: user.user_id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
      );
      // Gửi email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password/${resetToken}`;
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Đặt lại mật khẩu - Website học tiếng Anh',
        html: `
          <p>Xin chào,</p>
          <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới để đặt lại mật khẩu mới:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Link có hiệu lực trong 30 phút.</p>
          <p>Nếu không phải bạn, hãy bỏ qua email này.</p>
        `,
      };
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ status: { success: true, message: 'Nếu email tồn tại, hướng dẫn đã được gửi.' }, data: null });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({ status: { success: false, message: 'Lỗi server khi gửi email đặt lại mật khẩu' }, data: null });
    }
  }

  /**
   * Đặt lại mật khẩu mới bằng token
   * @param {string} token - Token reset password
   * @param {string} password - Mật khẩu mới
   * @returns {Promise<Object>}
   */
  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ status: { success: false, message: 'Thiếu token hoặc mật khẩu mới' }, data: null });
      }
      if (password.length < 6) {
        return res.status(400).json({ status: { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' }, data: null });
      }
      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(400).json({ status: { success: false, message: 'Token không hợp lệ hoặc đã hết hạn' }, data: null });
      }
      const user = await models.user.findByPk(payload.user_id);
      if (!user || user.email !== payload.email) {
        return res.status(400).json({ status: { success: false, message: 'Người dùng không tồn tại' }, data: null });
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      await models.user.update(
        { password: hashedPassword },
        { where: { user_id: user.user_id } }
      );
      return res.status(200).json({ status: { success: true, message: 'Đặt lại mật khẩu thành công' }, data: null });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ status: { success: false, message: 'Lỗi server khi đặt lại mật khẩu' }, data: null });
    }
  }

  /**
   * Đặt lại mật khẩu mới bằng OTP (quên mật khẩu)
   * @param {string} email
   * @param {string} newPassword
   * @returns {Promise<Object>}
   */
  static async updatePasswordByOtp(req, res) {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ status: { success: false, message: 'Thiếu email hoặc mật khẩu mới' }, data: null });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ status: { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' }, data: null });
      }
      // Kiểm tra trạng thái xác thực OTP
      const { otpStorage } = require('../middlewares/authMiddleware');
      const record = otpStorage.get(`forgot_${email}`);
      if (!record || !record.verified) {
        return res.status(400).json({ status: { success: false, message: 'Bạn chưa xác thực OTP hoặc OTP đã hết hạn' }, data: null });
      }
      const user = await models.user.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ status: { success: false, message: 'Người dùng không tồn tại' }, data: null });
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await models.user.update(
        { password: hashedPassword },
        { where: { user_id: user.user_id } }
      );
      // Xóa trạng thái OTP sau khi đổi mật khẩu
      otpStorage.delete(`forgot_${email}`);
      return res.status(200).json({ status: { success: true, message: 'Đặt lại mật khẩu thành công' }, data: null });
    } catch (error) {
      console.error('Update password by OTP error:', error);
      return res.status(500).json({ status: { success: false, message: 'Lỗi server khi đặt lại mật khẩu' }, data: null });
    }
  }
}

module.exports = AuthController;