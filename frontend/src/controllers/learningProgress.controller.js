import * as LearningProgressModel from '../models/learningProgress.model';

/**
 * Controller quản lý logic tiến trình học tập
 */
export class LearningProgressController {
  /**
   * Lấy tất cả tiến trình học tập (admin)
   * @returns {Promise<LearningProgressResponse>}
   */
  static async getAllLearningProgress() {
    try {
      return await LearningProgressModel.getAllLearningProgress();
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách tiến trình';
      throw new Error(message);
    }
  }

  /**
   * Lấy tiến trình học tập theo người dùng
   * @param {number} userId
   * @returns {Promise<LearningProgressResponse>}
   */
  static async getLearningProgressByUserId(userId) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    try {
      return await LearningProgressModel.getLearningProgressByUserId(userId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy tiến trình của người dùng';
      throw new Error(message);
    }
  }

  /**
   * Lấy tiến trình học tập theo loại bài học
   * @param {number} userId
   * @param {string} lessonType
   * @returns {Promise<LearningProgressResponse>}
   */
  static async getLearningProgressByLessonType(userId, lessonType) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    if (!lessonType || lessonType.trim() === '') throw new Error('Loại bài học không được để trống');
    const validLessonTypes = ['vocabulary', 'grammar', 'speaking', 'listening', 'reading', 'writing'];
    if (!validLessonTypes.includes(lessonType)) throw new Error('Loại bài học không hợp lệ');
    try {
      return await LearningProgressModel.getLearningProgressByLessonType(userId, lessonType);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy tiến trình theo loại bài học';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật tiến trình học tập
   * @param {{lesson_type: string, lesson_id?: number, skill_id?: number, progress_percent: number, status?: string}} progressData
   * @returns {Promise<LearningProgressResponse>}
   */
  static async updateLearningProgress(progressData) {
    if (!progressData.lesson_type || progressData.lesson_type.trim() === '') {
      throw new Error('Loại bài học không được để trống');
    }
    if (!progressData.lesson_id && !progressData.skill_id) {
      throw new Error('Phải có lesson_id hoặc skill_id');
    }
    if (progressData.progress_percent < 0 || progressData.progress_percent > 100 || isNaN(progressData.progress_percent)) {
      throw new Error('Phần trăm tiến trình phải từ 0 đến 100');
    }
    const validLessonTypes = ['vocabulary', 'grammar', 'speaking', 'listening', 'reading', 'writing'];
    if (!validLessonTypes.includes(progressData.lesson_type)) {
      throw new Error('Loại bài học không hợp lệ');
    }
    try {
      return await LearningProgressModel.updateLearningProgress(progressData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật tiến trình';
      throw new Error(message);
    }
  }
}