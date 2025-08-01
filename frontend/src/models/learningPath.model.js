import api from '../services/api';

/**
 * @typedef {Object} User
 * @property {number} user_id
 * @property {string} username
 */

/**
 * @typedef {Object} LearningPath
 * @property {number} path_id
 * @property {number} user_id
 * @property {string} path_title
 * @property {User} user
 */

/**
 * @typedef {Object} LearningPathsResponse
 * @property {"success"|"error"} status
 * @property {LearningPath[]} data
 * @property {string} message
 * @property {Object} pagination
 * @property {number} pagination.limit
 * @property {number} pagination.offset
 * @property {number} pagination.total
 */

/**
 * @typedef {Object} LearningPathResponse
 * @property {"success"|"error"} status
 * @property {LearningPath} data
 * @property {string} message
 */

/**
 * Lấy tất cả lộ trình học tập với phân trang
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<LearningPathsResponse>}
 */
export async function getAllLearningPaths(limit = 10, offset = 0) {
  try {
    const response = await api.get('/learning-paths', { params: { limit, offset } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Lấy lộ trình học tập theo người dùng
 * @param {number} userId
 * @returns {Promise<LearningPathsResponse>}
 */
export async function getLearningPathsByUserId(userId) {
  try {
    const response = await api.get(`/learning-paths/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Tạo lộ trình học tập được gợi ý
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export async function generateRecommendedPath(userId) {
  try {
    const response = await api.post(`/learning-paths/user/${userId}/recommend`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi tạo lộ trình gợi ý");
  }
}

/**
 * Lấy gợi ý bài học cho kỹ năng cụ thể
 * @param {number} userId
 * @param {string} skillType
 * @returns {Promise<Object>}
 */
export async function getSkillRecommendations(userId, skillType) {
  try {
    const response = await api.get(`/learning-paths/user/${userId}/skill/${skillType}/recommendations`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi lấy gợi ý bài học");
  }
}

/**
 * Tìm kiếm lộ trình học tập theo tiêu đề
 * @param {string} title
 * @returns {Promise<LearningPathsResponse>}
 */
export async function searchLearningPathsByTitle(title) {
  try {
    const response = await api.get('/learning-paths/search', { params: { title } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Tạo lộ trình học tập mới
 * @param {{user_id: number, path_title: string, description?: string}} data
 * @returns {Promise<LearningPathResponse>}
 */
export async function createLearningPath(data) {
  try {
    const response = await api.post('/learning-paths', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Cập nhật lộ trình học tập
 * @param {number} pathId
 * @param {{path_title?: string, description?: string}} data
 * @returns {Promise<LearningPathResponse>}
 */
export async function updateLearningPath(pathId, data) {
  try {
    const response = await api.put(`/learning-paths/${pathId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Xóa lộ trình học tập
 * @param {number} pathId
 * @returns {Promise<LearningPathResponse>}
 */
export async function deleteLearningPath(pathId) {
  try {
    const response = await api.delete(`/learning-paths/${pathId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}