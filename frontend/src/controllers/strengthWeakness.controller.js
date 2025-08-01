import * as StrengthWeaknessModel from '../models/strengthWeakness.model';

/**
 * Controller quản lý điểm mạnh và điểm yếu của người dùng
 */
export class StrengthWeaknessController {
  /**
   * Lấy danh sách điểm mạnh/yếu của người dùng
   * @param {number} userId
   * @returns {Promise<StrengthWeaknessResponse>}
   */
  static async getByUserId(userId) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    try {
      return await StrengthWeaknessModel.getStrengthWeaknessByUserId(userId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách điểm mạnh/yếu';
      throw new Error(message);
    }
  }

  /**
   * Lấy điểm mạnh/yếu của người dùng theo kỹ năng
   * @param {number} userId
   * @param {string} skillType
   * @returns {Promise<SingleStrengthWeaknessResponse>}
   */
  static async getByUserAndSkill(userId, skillType) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    if (!skillType || skillType.trim() === '') throw new Error('Loại kỹ năng không được để trống');
    if (!['listening', 'speaking', 'reading', 'writing'].includes(skillType)) {
      throw new Error('Loại kỹ năng không hợp lệ');
    }
    try {
      return await StrengthWeaknessModel.getStrengthWeaknessByUserAndSkill(userId, skillType);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy điểm mạnh/yếu theo kỹ năng';
      throw new Error(message);
    }
  }

  /**
   * Lấy phân tích kỹ năng của người dùng
   * @param {number} userId
   * @returns {Promise<StrengthWeaknessResponse>}
   */
  static async getUserSkillAnalysis(userId) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    try {
      return await StrengthWeaknessModel.getUserSkillAnalysis(userId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy phân tích kỹ năng';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật hoặc tạo điểm mạnh/yếu
   * @param {number} userId
   * @param {string} skillType
   * @param {{strength?: string, weakness?: string}} data
   * @returns {Promise<SingleStrengthWeaknessResponse>}
   */
  static async updateOrCreate(userId, skillType, data) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    if (!skillType || skillType.trim() === '' || skillType.length > 50) {
      throw new Error('Loại kỹ năng không hợp lệ');
    }
    if (data.strength && (typeof data.strength !== 'string' || data.strength.length > 1000)) {
      throw new Error('Điểm mạnh không hợp lệ');
    }
    if (data.weakness && (typeof data.weakness !== 'string' || data.weakness.length > 1000)) {
      throw new Error('Điểm yếu không hợp lệ');
    }
    if (!['listening', 'speaking', 'reading', 'writing'].includes(skillType)) {
      throw new Error('Loại kỹ năng không hợp lệ');
    }
    try {
      return await StrengthWeaknessModel.updateOrCreateStrengthWeakness(userId, skillType, data);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật điểm mạnh/yếu';
      throw new Error(message);
    }
  }
}