import * as LearningPathModel from '../models/learningPath.model';

/**
 * Controller quản lý logic lộ trình học tập
 */
export class LearningPathController {
  /**
   * Lấy tất cả lộ trình học tập
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<LearningPathsResponse>}
   */
  static async getAllLearningPaths(limit = 10, offset = 0) {
    if (limit < 1 || offset < 0) throw new Error('Limit hoặc offset không hợp lệ');
    try {
      return await LearningPathModel.getAllLearningPaths(limit, offset);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách lộ trình';
      throw new Error(message);
    }
  }

  /**
   * Lấy lộ trình học tập theo người dùng
   * @param {number} userId
   * @returns {Promise<LearningPathsResponse>}
   */
  static async getLearningPathsByUserId(userId) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    try {
      return await LearningPathModel.getLearningPathsByUserId(userId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy lộ trình của người dùng';
      throw new Error(message);
    }
  }

  /**
   * Tìm kiếm lộ trình học tập theo tiêu đề
   * @param {string} title
   * @returns {Promise<LearningPathsResponse>}
   */
  static async searchLearningPathsByTitle(title) {
    if (!title || title.trim() === '') throw new Error('Tiêu đề tìm kiếm không được để trống');
    if (title.length > 255) throw new Error('Tiêu đề tìm kiếm quá dài (tối đa 255 ký tự)');
    try {
      return await LearningPathModel.searchLearningPathsByTitle(title);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tìm kiếm lộ trình';
      throw new Error(message);
    }
  }

  /**
   * Tạo lộ trình học tập mới
   * @param {number} userId
   * @param {{path_title: string, description?: string}} data
   * @returns {Promise<LearningPathResponse>}
   */
  static async createLearningPath(userId, data) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    const { path_title } = data;
    if (!path_title || path_title.trim() === '') throw new Error('Tiêu đề lộ trình không được để trống');
    if (path_title.length > 255) throw new Error('Tiêu đề quá dài (tối đa 255 ký tự)');
    if (data.description && data.description.length > 500) throw new Error('Mô tả quá dài (tối đa 500 ký tự)');
    try {
      return await LearningPathModel.createLearningPath({ user_id: userId, ...data });
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tạo lộ trình';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật lộ trình học tập
   * @param {number} pathId
   * @param {{path_title?: string, description?: string}} data
   * @returns {Promise<LearningPathResponse>}
   */
  static async updateLearningPath(pathId, data) {
    if (!pathId || isNaN(pathId)) throw new Error('ID lộ trình không hợp lệ');
    const { path_title } = data;
    if (path_title && (path_title.trim() === '' || path_title.length > 255)) throw new Error('Tiêu đề không hợp lệ (1-255 ký tự)');
    if (data.description && data.description.length > 500) throw new Error('Mô tả quá dài (tối đa 500 ký tự)');
    try {
      return await LearningPathModel.updateLearningPath(pathId, data);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật lộ trình';
      throw new Error(message);
    }
  }

  /**
   * Xóa lộ trình học tập
   * @param {number} pathId
   * @returns {Promise<LearningPathResponse>}
   */
  static async deleteLearningPath(pathId) {
    if (!pathId || isNaN(pathId)) throw new Error('ID lộ trình không hợp lệ');
    try {
      return await LearningPathModel.deleteLearningPath(pathId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi xóa lộ trình';
      throw new Error(message);
    }
  }
}