import api from '../services/api';

/**
 * @typedef {Object} ServicePackage
 * @property {number} package_id
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {number} duration_days
 * @property {string} created_at
 */

/**
 * @typedef {Object} UserService
 * @property {number} id
 * @property {number} user_id
 * @property {number} package_id
 * @property {string} start_date
 * @property {string} end_date
 * @property {ServicePackage} servicepackage
 */

/**
 * @typedef {Object} ServicePackageResponse
 * @property {"success"|"error"} status
 * @property {ServicePackage[]|UserService[]} data
 * @property {string} message
 * @property {{limit?: number, offset?: number, total?: number}} pagination
 */

/**
 * @typedef {Object} SingleServicePackageResponse
 * @property {"success"|"error"} status
 * @property {ServicePackage|UserService} data
 * @property {string} message
 */

/**
 * Lấy tất cả gói dịch vụ
 * @param {{limit?: number, offset?: number, order?: Array}} params
 * @returns {Promise<ServicePackageResponse>}
 */
export async function getAllServicePackages(params = {}) {
  try {
    const response = await api.get('/service-packages', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Lấy gói dịch vụ theo ID
 * @param {number} id
 * @returns {Promise<SingleServicePackageResponse>}
 */
export async function getServicePackageById(id) {
  try {
    const response = await api.get(`/service-packages/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Tạo gói dịch vụ mới
 * @param {{name: string, description?: string, price: number, duration_days: number}} packageData
 * @returns {Promise<SingleServicePackageResponse>}
 */
export async function createServicePackage(packageData) {
  try {
    const response = await api.post('/service-packages', packageData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Cập nhật gói dịch vụ
 * @param {number} id
 * @param {{name?: string, description?: string, price?: number, duration_days?: number}} packageData
 * @returns {Promise<SingleServicePackageResponse>}
 */
export async function updateServicePackage(id, packageData) {
  try {
    const response = await api.put(`/service-packages/${id}`, packageData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Xóa gói dịch vụ
 * @param {number} id
 * @returns {Promise<SingleServicePackageResponse>}
 */
export async function deleteServicePackage(id) {
  try {
    const response = await api.delete(`/service-packages/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Lấy danh sách dịch vụ của người dùng
 * @param {number} userId
 * @returns {Promise<ServicePackageResponse>}
 */
export async function getUserServices(userId) {
  try {
    const response = await api.get(`/service-packages/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Đăng ký gói dịch vụ cho người dùng
 * @param {{userId: number, packageId: number}} subscriptionData
 * @returns {Promise<SingleServicePackageResponse>}
 */
export async function subscribeUser(subscriptionData) {
  try {
    const response = await api.post('/service-packages/subscribe', subscriptionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Tạo thanh toán cho gói dịch vụ
 * @param {{user_id: number, package_id: number, amount: number, payment_method_id: number, customer_info: Object}} paymentData
 * @returns {Promise<SingleServicePackageResponse>}
 */
export async function createPayment(paymentData) {
  try {
    const response = await api.post('/payments', paymentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}