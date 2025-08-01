import api from '../services/api';
import axios from 'axios';
/**
 * @typedef {Object} Profile
 * @property {number} profile_id
 * @property {string} full_name
 * @property {string} gender
 * @property {string} birthdate
 * @property {string} avatar_url
 */

/**
 * @typedef {Object} User
 * @property {number} user_id
 * @property {string} username
 * @property {string} email
 * @property {string} role
 * @property {string} created_at
 * @property {Profile} profile
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
 * @property {Object} lesson
 * @property {Object} skilllesson
 * @property {User} user
 */

/**
 * @typedef {Object} StrengthWeakness
 * @property {string} skill_type
 * @property {string} strength
 * @property {string} weakness
 */

/**
 * @typedef {Object} TestAttempt
 * @property {number} attempt_id
 * @property {number} quiz_id
 * @property {number} score
 * @property {string} started_at
 * @property {string} completed_at
 * @property {Object} quiz
 */

/**
 * @typedef {Object} Payment
 * @property {number} payment_id
 * @property {number} user_id
 * @property {number} package_id
 * @property {number} amount
 * @property {string} status
 * @property {string} paid_at
 * @property {Object} servicepackage
 * @property {Object[]} transactions
 */

/**
 * @typedef {Object} UserService
 * @property {number} id
 * @property {number} user_id
 * @property {number} package_id
 * @property {string} start_date
 * @property {string} end_date
 * @property {Object} servicepackage
 */

/**
 * @typedef {Object} UserStats
 * @property {number} totalUsers
 * @property {number} adminCount
 * @property {number} studentCount
 * @property {number} activeUsers
 * @property {User[]} recentUsers
 */

/**
 * @typedef {Object} UserResponse
 * @property {"success"|"error"} status
 * @property {User[]|LearningProgress[]|Payment[]|UserService[]|UserStats} data
 * @property {string} message
 */

/**
 * @typedef {Object} SingleUserResponse
 * @property {"success"|"error"} status
 * @property {User|Profile|Object} data
 * @property {string} message
 */

/**
 * Lấy danh sách tất cả người dùng
 * @returns {Promise<UserResponse>}
 */
export async function getAllUsers() {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy thông tin người dùng theo ID
 * @param {number} userId
 * @returns {Promise<SingleUserResponse>}
 */
export async function getUserById(userId) {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Cập nhật thông tin người dùng
 * @param {number} userId
 * @param {{username?: string, email?: string, role?: string}} updateData
 * @returns {Promise<SingleUserResponse>}
 */
export async function updateUser(userId, updateData) {
  try {
    const response = await api.put(`/users/${userId}`, updateData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Cập nhật hồ sơ người dùng
 * @param {number} userId
 * @param {{full_name?: string, gender?: string, birthdate?: string}} profileData
 * @returns {Promise<SingleUserResponse>}
 */
export async function updateProfile(userId, profileData) {
  try {
    const response = await api.put(`/users/${userId}/profile`, profileData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy tiến trình học tập của người dùng
 * @param {number} userId
 * @returns {Promise<UserResponse>}
 */
export async function getLearningProgress(userId) {
  try {
    const response = await api.get(`/users/${userId}/learning-progress`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy lịch sử thanh toán của người dùng
 * @param {number} userId
 * @returns {Promise<UserResponse>}
 */
export async function getPaymentHistory(userId) {
  try {
    const response = await api.get(`/users/${userId}/payment-history`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy danh sách gói dịch vụ đang hoạt động
 * @param {number} userId
 * @returns {Promise<UserResponse>}
 */
export async function getActiveServices(userId) {
  try {
    const response = await api.get(`/users/${userId}/active-services`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Tìm kiếm người dùng theo username hoặc email
 * @param {string} searchTerm
 * @returns {Promise<UserResponse>}
 */
export async function searchUsers(searchTerm) {
  try {
    const response = await api.get('/users/search', { params: { q: searchTerm } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Upload avatar cho người dùng
 * @param {number} userId
 * @param {string} avatarUrl
 * @returns {Promise<SingleUserResponse>}
 */
export async function uploadAvatar(userId, avatarUrl) {
  try {
    console.log('API call - uploadAvatar:', { userId, avatarUrlLength: avatarUrl?.length });

    const payload = {
      url: avatarUrl,
      public_id: null // Không sử dụng Cloudinary public_id cho base64
    };

    console.log('API payload:', { ...payload, url: payload.url?.substring(0, 100) + '...' });

    const response = await api.put(`/users/${userId}/avatar`, payload);
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API error - uploadAvatar:', error);
    console.error('Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Upload avatar cho người dùng sử dụng FormData (cho file upload)
 * @param {number} userId
 * @param {File} avatarFile
 * @returns {Promise<SingleUserResponse>}
 */
export async function uploadAvatarWithFormData(userId, avatarFile) {
  try {
    console.log('API call - uploadAvatarWithFormData:', { userId, fileName: avatarFile?.name, fileSize: avatarFile?.size });

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    // Tạo axios instance riêng cho FormData
    const formDataApi = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
      timeout: 30000, // Tăng timeout cho upload file
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Thêm token
    const token = localStorage.getItem('token');
    if (token) {
      formDataApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const response = await formDataApi.put(`/users/${userId}/avatar-upload`, formData);
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API error - uploadAvatarWithFormData:', error);
    console.error('Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}


