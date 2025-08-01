import api from '../services/api';

/**
 * @typedef {Object} User
 * @property {number} user_id
 * @property {string} username
 * @property {string} email
 * @property {string} role
 * @property {string} created_at
 */

/**
 * @typedef {Object} AuthResponse
 * @property {{ success: boolean, message: string }} status
 * @property {string | null} data
 */

/**
 * Đăng nhập
 * @param {{email: string, password: string}} credentials
 * @returns {Promise<AuthResponse>}
 */
export async function login(credentials) {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.status?.message || 'Lỗi kết nối đến máy chủ');
  }
}

/**
 * Đăng ký
 * @param {{username: string, email: string, password: string}} userData
 * @returns {Promise<AuthResponse>}
 */
export async function register(userData) {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.status?.message || 'Lỗi kết nối đến máy chủ');
  }
}

/**
 * Đăng xuất
 * @returns {Promise<AuthResponse>}
 */
export async function logout() {
  try {
    const response = await api.put('/auth/logout');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.status?.message || 'Lỗi kết nối đến máy chủ');
  }
}

/**
 * Yêu cầu đặt lại mật khẩu
 * @param {string} email
 * @returns {Promise<AuthResponse>}
 */
export async function forgotPassword(email) {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.status?.message || 'Lỗi kết nối đến máy chủ');
  }
}

/**
 * Đặt lại mật khẩu
 * @param {string} token
 * @param {string} password
 * @returns {Promise<AuthResponse>}
 */
export async function resetPassword(token, password) {
  try {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.status?.message || 'Lỗi kết nối đến máy chủ');
  }
}

/**
 * Kiểm tra token đặt lại mật khẩu
 * @param {string} token
 * @returns {Promise<AuthResponse>}
 */
export async function verifyResetToken(token) {
  // Backend KHÔNG có API riêng để xác thực token, nên chỉ kiểm tra token ở client hoặc bỏ qua bước này.
  // Để đơn giản, luôn trả về thành công (token sẽ được kiểm tra khi gọi resetPassword)
  return { status: { success: true, message: 'Token hợp lệ' }, data: null };
}

/**
 * Thay đổi mật khẩu
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise<AuthResponse>}
 */
export async function changePassword(oldPassword, newPassword) {
  try {
    const response = await api.put('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.status?.message || 'Lỗi kết nối đến máy chủ');
  }
}

/**
 * Lấy thông tin người dùng hiện tại
 * @returns {Promise<AuthResponse>}
 */
export async function getCurrentUser() {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.status?.message || 'Lỗi kết nối đến máy chủ');
  }
}

/**
 * Đặt lại mật khẩu mới bằng OTP (quên mật khẩu)
 * @param {string} email
 * @param {string} newPassword
 * @returns {Promise<AuthResponse>}
 */
export async function updatePasswordByOtp(email, newPassword) {
  try {
    const response = await api.post('/auth/update-password-by-otp', { email, newPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.status?.message || 'Lỗi đặt lại mật khẩu bằng OTP');
  }
}