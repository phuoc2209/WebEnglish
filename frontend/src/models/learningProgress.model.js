import api from '../services/api';

/**
 * @typedef {Object} User
 * @property {number} user_id
 * @property {string} username
 * @property {string} email
 */

/**
 * @typedef {Object} LearningProgress
 * @property {number} progress_id
 * @property {number} user_id
 * @property {string} lesson_type
 * @property {number} lesson_id
 * @property {number} skill_id
 * @property {number} progress_percent
 * @property {string} status
 * @property {string} last_accessed_at
 * @property {User} user
 */

/**
 * @typedef {Object} LearningProgressResponse
 * @property {"success"|"error"} status
 * @property {LearningProgress[]} data
 * @property {string} message
 */

/**
 * Lấy tất cả tiến trình học tập (admin)
 * @returns {Promise<LearningProgressResponse>}
 */
export async function getAllLearningProgress() {
  try {
    const response = await api.get('/learning-progress');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy tiến trình học tập theo người dùng
 * @param {number} userId
 * @returns {Promise<LearningProgressResponse>}
 */
export async function getLearningProgressByUserId(userId) {
  try {
    const response = await api.get(`/learning-progress/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy tiến trình học tập theo loại bài học
 * @param {number} userId
 * @param {string} lessonType
 * @returns {Promise<LearningProgressResponse>}
 */
export async function getLearningProgressByLessonType(userId, lessonType) {
  try {
    const response = await api.get(`/learning-progress/user/${userId}/lesson-type/${lessonType}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Cập nhật tiến trình học tập
 * @param {{user_id: number, lesson_type: string, lesson_id?: number, skill_id?: number, progress_percent: number, status?: string}} data
 * @returns {Promise<LearningProgressResponse>}
 */
export async function updateLearningProgress(data) {
  try {
    const requestData = {
      userId: data.user_id,
      lessonType: data.lesson_type,
      lessonId: data.lesson_id,
      progressPercent: data.progress_percent
    };
    const response = await api.put('/learning-progress/update', requestData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}