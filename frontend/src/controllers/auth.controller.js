import * as AuthModel from '../models/auth.model';

/**
 * Controller quản lý xác thực
 */
export class AuthController {
  /**
   * Đăng nhập
   * @param {{email: string, password: string}} credentials
   * @returns {Promise<AuthResponse>}
   */
  static async login(credentials) {
    if (!credentials.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      throw new Error('Email không hợp lệ');
    }
    if (!credentials.password || credentials.password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }
    try {
      return await AuthModel.login(credentials);
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      throw new Error(message);
    }
  }

  /**
   * Đăng ký
   * @param {{username: string, email: string, password: string}} userData
   * @returns {Promise<AuthResponse>}
   */
  static async register(userData) {
    if (!userData.username || userData.username.trim() === '' || userData.username.length > 100) {
      throw new Error('Username không hợp lệ (1-100 ký tự)');
    }
    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      throw new Error('Email không hợp lệ');
    }
    if (!userData.password || userData.password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }
    try {
      return await AuthModel.register(userData);
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      throw new Error(message);
    }
  }

  /**
   * Đăng xuất
   * @returns {Promise<AuthResponse>}
   */
  static async logout() {
    try {
      return await AuthModel.logout();
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng xuất thất bại';
      throw new Error(message);
    }
  }

  /**
   * Yêu cầu đặt lại mật khẩu
   * @param {string} email
   * @returns {Promise<AuthResponse>}
   */
  static async forgotPassword(email) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email không hợp lệ');
    }
    try {
      return await AuthModel.forgotPassword(email);
    } catch (error) {
      const message = error.response?.data?.message || 'Gửi yêu cầu đặt lại mật khẩu thất bại';
      throw new Error(message);
    }
  }

  /**
   * Đặt lại mật khẩu
   * @param {string} token
   * @param {string} password
   * @returns {Promise<AuthResponse>}
   */
  static async resetPassword(token, password) {
    if (!token || token.trim() === '') {
      throw new Error('Token không hợp lệ');
    }
    if (!password || password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }
    try {
      return await AuthModel.resetPassword(token, password);
    } catch (error) {
      const message = error.response?.data?.message || 'Đặt lại mật khẩu thất bại';
      throw new Error(message);
    }
  }

  /**
   * Thay đổi mật khẩu
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns {Promise<AuthResponse>}
   */
  static async changePassword(oldPassword, newPassword) {
    if (!oldPassword || oldPassword.length < 6) {
      throw new Error('Mật khẩu cũ phải có ít nhất 6 ký tự');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    try {
      return await AuthModel.changePassword(oldPassword, newPassword);
    } catch (error) {
      const message = error.response?.data?.message || 'Thay đổi mật khẩu thất bại';
      throw new Error(message);
    }
  }


  static async verifyResetToken(token) {
    if (!token || token.trim() === '') {
      throw new Error('Token không hợp lệ');
    }
    try {
      return await AuthModel.verifyResetToken(token);
    } catch (error) {
      throw new Error(error.message || 'Token không hợp lệ hoặc đã hết hạn');
    }
  }

  static async getCurrentUser() {
    try {
      return await AuthModel.getCurrentUser();
    } catch (error) {
      throw new Error(error.message || 'Không thể lấy thông tin người dùng');
    }
  }
}