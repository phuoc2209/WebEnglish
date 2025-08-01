import api from '../services/api';

/**
 * @typedef {Object} User
 * @property {number} user_id
 * @property {string} username
 */

/**
 * @typedef {Object} StrengthWeakness
 * @property {number} id
 * @property {number} user_id
 * @property {string} skill_type
 * @property {string|null} strength
 * @property {string|null} weakness
 * @property {User} user
 */

/**
 * @typedef {Object} SkillAnalysis
 * @property {Object} listening
 * @property {Object} speaking
 * @property {Object} reading
 * @property {Object} writing
 * @property {string[]} strengths
 * @property {string[]} weaknesses
 * @property {number|null} averageScore
 * @property {number} submissionCount
 */

/**
 * @typedef {Object} StrengthWeaknessResponse
 * @property {"success"|"error"} status
 * @property {StrengthWeakness[]|SkillAnalysis} data
 * @property {string} message
 */

/**
 * @typedef {Object} SingleStrengthWeaknessResponse
 * @property {"success"|"error"} status
 * @property {StrengthWeakness|null} data
 * @property {string} message
 */

/**
 * Lấy danh sách điểm mạnh/yếu của người dùng
 * @param {number} userId
 * @returns {Promise<StrengthWeaknessResponse>}
 */
export async function getStrengthWeaknessByUserId(userId) {
  try {
    const response = await api.get(`/strength-weakness/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Lấy điểm mạnh/yếu của người dùng theo kỹ năng
 * @param {number} userId
 * @param {string} skillType
 * @returns {Promise<SingleStrengthWeaknessResponse>}
 */
export async function getStrengthWeaknessByUserAndSkill(userId, skillType) {
  try {
    const response = await api.get(`/strength-weakness/user/${userId}/skill/${skillType}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Lấy phân tích kỹ năng của người dùng
 * @param {number} userId
 * @returns {Promise<StrengthWeaknessResponse>}
 */
export async function getUserSkillAnalysis(userId) {
  try {
    const response = await api.get(`/strength-weakness/user/${userId}/analysis`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Cập nhật hoặc tạo điểm mạnh/yếu
 * @param {number} userId
 * @param {string} skillType
 * @param {{strength?: string, weakness?: string}} data
 * @returns {Promise<SingleStrengthWeaknessResponse>}
 */
export async function updateOrCreateStrengthWeakness(userId, skillType, data) {
  try {
    const response = await api.put(`/strength-weakness/user/${userId}/skill/${skillType}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

// Lấy phân tích điểm mạnh/yếu của user
export async function fetchStrengthWeaknessAnalysis(userId, token) {
  try {
    const res = await api.get(`/strength-weakness/user/${userId}/analysis`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy phân tích điểm mạnh/yếu' };
  }
}