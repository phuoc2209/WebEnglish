import * as ServicePackageModel from '../models/service.model';

/**
 * Controller quản lý gói dịch vụ và đăng ký
 */
export class ServicePackageController {
  /**
   * Lấy tất cả gói dịch vụ
   * @param {{limit?: number, offset?: number, order?: Array}} params
   * @returns {Promise<ServicePackageResponse>}
   */
  static async getAll(params = {}) {
    if (params.limit < 1 || params.offset < 0) throw new Error('Limit hoặc offset không hợp lệ');
    if (params.order && !Array.isArray(params.order)) throw new Error('Sắp xếp không hợp lệ');
    try {
      return await ServicePackageModel.getAllServicePackages(params);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách gói dịch vụ';
      throw new Error(message);
    }
  }

  /**
   * Lấy gói dịch vụ theo ID
   * @param {number} id
   * @returns {Promise<SingleServicePackageResponse>}
   */
  static async getById(id) {
    if (!id || isNaN(id)) throw new Error('ID gói dịch vụ không hợp lệ');
    try {
      return await ServicePackageModel.getServicePackageById(id);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy thông tin gói dịch vụ';
      throw new Error(message);
    }
  }

  /**
   * Tạo gói dịch vụ mới
   * @param {{name: string, description?: string, price: number, duration_days: number}} packageData
   * @returns {Promise<SingleServicePackageResponse>}
   */
  static async create(packageData) {
    if (!packageData.name || packageData.name.trim() === '') throw new Error('Tên gói dịch vụ không được để trống');
    if (packageData.price === undefined || isNaN(packageData.price) || packageData.price < 0) throw new Error('Giá gói dịch vụ không hợp lệ');
    if (packageData.duration_days === undefined || isNaN(packageData.duration_days) || packageData.duration_days <= 0 || !Number.isInteger(packageData.duration_days)) throw new Error('Thời gian sử dụng không hợp lệ');
    try {
      return await ServicePackageModel.createServicePackage(packageData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tạo gói dịch vụ';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật gói dịch vụ
   * @param {number} id
   * @param {{name?: string, description?: string, price?: number, duration_days?: number}} packageData
   * @returns {Promise<SingleServicePackageResponse>}
   */
  static async update(id, packageData) {
    if (!id || isNaN(id)) throw new Error('ID gói dịch vụ không hợp lệ');
    if (packageData.name && (packageData.name.trim() === '' || packageData.name.length > 100)) throw new Error('Tên gói không hợp lệ');
    if (packageData.price !== undefined && (isNaN(packageData.price) || packageData.price < 0)) throw new Error('Giá gói dịch vụ không hợp lệ');
    if (packageData.duration_days !== undefined && (isNaN(packageData.duration_days) || packageData.duration_days <= 0 || !Number.isInteger(packageData.duration_days))) throw new Error('Thời gian sử dụng không hợp lệ');
    try {
      return await ServicePackageModel.updateServicePackage(id, packageData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật gói dịch vụ';
      throw new Error(message);
    }
  }

  /**
   * Xóa gói dịch vụ
   * @param {number} id
   * @returns {Promise<SingleServicePackageResponse>}
   */
  static async delete(id) {
    if (!id || isNaN(id)) throw new Error('ID gói dịch vụ không hợp lệ');
    try {
      return await ServicePackageModel.deleteServicePackage(id);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi xóa gói dịch vụ';
      throw new Error(message);
    }
  }

  /**
   * Lấy danh sách dịch vụ của người dùng
   * @param {number} userId
   * @returns {Promise<ServicePackageResponse>}
   */
  static async getUserServices(userId) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    try {
      return await ServicePackageModel.getUserServices(userId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách dịch vụ';
      throw new Error(message);
    }
  }

  /**
   * Đăng ký gói dịch vụ cho người dùng
   * @param {{userId: number, packageId: number}} subscriptionData
   * @returns {Promise<SingleServicePackageResponse>}
   */
  static async subscribeUser(subscriptionData) {
    if (!subscriptionData.userId || isNaN(subscriptionData.userId)) throw new Error('ID người dùng không hợp lệ');
    if (!subscriptionData.packageId || isNaN(subscriptionData.packageId)) throw new Error('ID gói dịch vụ không hợp lệ');
    try {
      return await ServicePackageModel.subscribeUser(subscriptionData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi đăng ký gói dịch vụ';
      throw new Error(message);
    }
  }
}