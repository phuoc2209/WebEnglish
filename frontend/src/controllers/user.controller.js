import * as UserModel from '../models/user.model';

/**
 * Controller quản lý thông tin và hoạt động của người dùng
 */
export class UserController {
  /**
   * Lấy danh sách tất cả người dùng
   * @returns {Promise<UserResponse>}
   */
  static async getAllUsers() {
    try {
      return await UserModel.getAllUsers();
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách người dùng';
      throw new Error(message);
    }
  }

  /**
   * Lấy thông tin người dùng theo ID
   * @param {number} userId
   * @returns {Promise<SingleUserResponse>}
   */
  static async getUserById(userId) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    try {
      return await UserModel.getUserById(userId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy thông tin người dùng';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật thông tin người dùng
   * @param {number} userId
   * @param {{username?: string, email?: string, role?: string}} updateData
   * @returns {Promise<SingleUserResponse>}
   */
  static async updateUser(userId, updateData) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    if (updateData.username && (updateData.username.trim() === '' || updateData.username.length > 100)) {
      throw new Error('Username không hợp lệ');
    }
    if (updateData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
      throw new Error('Email không hợp lệ');
    }
    if (updateData.role && !['student', 'admin'].includes(updateData.role)) {
      throw new Error('Vai trò không hợp lệ');
    }
    try {
      return await UserModel.updateUser(userId, updateData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật thông tin người dùng';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật hồ sơ người dùng
   * @param {number} userId
   * @param {{full_name?: string, gender?: string, birthdate?: string}} profileData
   * @returns {Promise<SingleUserResponse>}
   */
  static async updateProfile(userId, profileData) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    if (profileData.full_name && (profileData.full_name.trim() === '' || profileData.full_name.length > 255)) {
      throw new Error('Họ và tên không hợp lệ (1-255 ký tự)');
    }
    if (profileData.gender && !['male', 'female', 'other'].includes(profileData.gender)) {
      throw new Error('Giới tính không hợp lệ');
    }
    if (profileData.birthdate && new Date(profileData.birthdate) > new Date()) {
      throw new Error('Ngày sinh không được là tương lai');
    }
    try {
      return await UserModel.updateProfile(userId, profileData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật hồ sơ';
      throw new Error(message);
    }
  }

  /**
   * Lấy tiến trình học tập của người dùng
   * @param {number} userId
   * @returns {Promise<UserResponse>}
   */
  static async getLearningProgress(userId) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    try {
      return await UserModel.getLearningProgress(userId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy tiến trình học tập';
      throw new Error(message);
    }
  }

  /**
   * Lấy lịch sử thanh toán của người dùng
   * @param {number} userId
   * @returns {Promise<UserResponse>}
   */
  static async getPaymentHistory(userId) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    try {
      return await UserModel.getPaymentHistory(userId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy lịch sử thanh toán';
      throw new Error(message);
    }
  }

  /**
   * Lấy danh sách gói dịch vụ đang hoạt động
   * @param {number} userId
   * @returns {Promise<UserResponse>}
   */
  static async getActiveServices(userId) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    try {
      return await UserModel.getActiveServices(userId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy dịch vụ đang hoạt động';
      throw new Error(message);
    }
  }

  /**
   * Tìm kiếm người dùng theo username hoặc email
   * @param {string} searchTerm
   * @returns {Promise<UserResponse>}
   */
  static async searchUsers(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '' || searchTerm.length > 100) {
      throw new Error('Từ khóa tìm kiếm không hợp lệ');
    }
    try {
      return await UserModel.searchUsers(searchTerm);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tìm kiếm người dùng';
      throw new Error(message);
    }
  }
}