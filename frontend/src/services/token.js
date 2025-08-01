/**
 * Lưu token vào localStorage
 * @param {string} token - JWT token
 * @throws {Error} Nếu token không hợp lệ
 */
export const setToken = (token) => {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    console.error(`[${new Date().toISOString()}] Invalid token: ${token}`);
    throw new Error('Token không hợp lệ');
  }
  console.log(`[${new Date().toISOString()}] Setting token`);
  localStorage.setItem('token', token);
};

/**
 * Lấy token từ localStorage
 * @returns {string|null} Token hoặc null nếu không tồn tại
 */
export const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn(`[${new Date().toISOString()}] No token found in localStorage`);
    return null;
  }
  console.log(`[${new Date().toISOString()}] Getting token`);
  return token;
};

/**
 * Xóa token khỏi localStorage
 */
export const removeToken = () => {
  console.log(`[${new Date().toISOString()}] Removing token`);
  localStorage.removeItem('token');
};

/**
 * Lưu thông tin user vào localStorage
 * @param {{user_id: number, role: string, username: string, email: string}} user - Thông tin user
 * @throws {Error} Nếu user không hợp lệ
 */
export const setUser = (user) => {
  if (!user || typeof user !== 'object' || !user.user_id || !user.role) {
    console.error(`[${new Date().toISOString()}] Invalid user: ${JSON.stringify(user)}`);
    throw new Error('Thông tin user không hợp lệ');
  }
  console.log(`[${new Date().toISOString()}] Setting user: ${user.username}`);
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Lấy thông tin user từ localStorage
 * @returns {{user_id: number, role: string, username: string, email: string}|null} User hoặc null
 */
export const getUser = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    console.warn(`[${new Date().toISOString()}] No user found in localStorage`);
    return null;
  }
  try {
    console.log(`[${new Date().toISOString()}] Getting user`);
    return JSON.parse(user);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error parsing user: ${error.message}`);
    return null;
  }
};

/**
 * Xóa thông tin user khỏi localStorage
 */
export const removeUser = () => {
  console.log(`[${new Date().toISOString()}] Removing user`);
  localStorage.removeItem('user');
};

/**
 * Xóa tất cả thông tin auth
 */
export const clearAuth = () => {
  console.log(`[${new Date().toISOString()}] Clearing auth`);
  removeToken();
  removeUser();
};