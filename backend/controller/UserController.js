const sequelize = require("../config/database");
const { Op } = require("sequelize");
const initModels = require("../models/init-models");
const models = initModels(sequelize);
console.log('📦 Danh sách models:', Object.keys(models));


/**
 * Controller quản lý thông tin và hoạt động của người dùng trên website học tiếng Anh
 */
class UserController {
  /**
   * Lấy danh sách tất cả người dùng (admin only)
   * @param {Object} req - Yêu cầu HTTP
   * @returns {Promise<Object>} - Danh sách người dùng
   * @throws {Error} - Nếu không có quyền hoặc truy vấn thất bại
   */
  static async getAll(req) {
    if (!req.user || req.user.role !== "admin") throw new Error("Quyền bị từ chối. Chỉ admin mới được thực hiện hành động này.");
    try {
      const users = await models.user.findAll({
        attributes: ["user_id", "username", "email", "role", "created_at", "full_name", "gender", "birthdate", "avatar_url", "is_locked"],
      });

      return {
        status: "success",
        data: users,
        message: "Lấy danh sách người dùng thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách người dùng: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin người dùng theo ID
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @returns {Promise<Object>} - Thông tin người dùng
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async getUserById(req, userId) {
    try {
      if (!req.user) throw new Error("Không xác thực được người dùng");
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      // Tạm bỏ kiểm tra quyền
      // if (req.user.user_id !== userId && req.user.role !== "admin") throw new Error("Không có quyền truy cập thông tin người dùng này");

      const user = await models.user.findByPk(userId, {
        attributes: ["user_id", "username", "email", "role", "created_at", "full_name", "gender", "birthdate", "avatar_url"],
      });
      if (!user) throw new Error("Không tìm thấy người dùng");

      return {
        status: "success",
        data: user,
        message: "Lấy thông tin người dùng thành công",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Object>} - Thông tin người dùng đã cập nhật
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async update(req, userId, updateData) {
    const transaction = await sequelize.transaction();
    try {
      userId = parseInt(userId);
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (req.user.user_id !== userId && req.user.role !== "admin") throw new Error("Không có quyền cập nhật thông tin người dùng này");

      const { username, email, role } = updateData;
      if (username && (typeof username !== "string" || username.trim() === "" || username.length > 100)) {
        throw new Error("Username không hợp lệ (1-100 ký tự)");
      }
      if (email && (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100)) {
        throw new Error("Email không hợp lệ (tối đa 100 ký tự)");
      }
      if (role && !["student", "admin"].includes(role)) throw new Error("Vai trò không hợp lệ");

      const user = await models.user.findByPk(userId, { transaction });
      if (!user) throw new Error("Không tìm thấy người dùng");

      if (email && email !== user.email) {
        const existingUser = await models.user.findOne({ where: { email }, transaction });
        if (existingUser) throw new Error("Email đã được sử dụng");
      }

      if (username && username !== user.username) {
        const existingUser = await models.user.findOne({ where: { username }, transaction });
        if (existingUser) throw new Error("Username đã được sử dụng");
      }

      await models.user.update(
        {
          username: username || user.username,
          email: email || user.email,
          role: role || user.role,
        },
        { where: { user_id: userId }, transaction }
      );

      const updatedUser = await models.user.findByPk(userId, {
        attributes: ["user_id", "username", "email", "role", "created_at"],
        transaction,
      });

      await transaction.commit();
      return {
        status: "success",
        data: updatedUser,
        message: "Cập nhật thông tin người dùng thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi cập nhật thông tin người dùng: ${error.message}`);
    }
  }

  /**
   * Cập nhật hồ sơ cá nhân của người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @param {Object} profileData - Dữ liệu hồ sơ
   * @returns {Promise<Object>} - Hồ sơ đã cập nhật
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async updateProfile(req, userId, profileData) {
    const transaction = await sequelize.transaction();
    try {
      userId = parseInt(userId);
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (req.user.user_id !== userId && req.user.role !== "admin") throw new Error("Không có quyền cập nhật hồ sơ của người dùng này");

      const { full_name, gender, birthdate } = profileData;
      if (full_name && (typeof full_name !== "string" || full_name.trim() === "" || full_name.length > 255)) {
        throw new Error("Họ tên không hợp lệ (1-255 ký tự)");
      }
      if (gender && !["male", "female", "other"].includes(gender)) throw new Error("Giới tính không hợp lệ");
      if (birthdate && new Date(birthdate) > new Date()) throw new Error("Ngày sinh không được là tương lai");

      const user = await models.user.findByPk(userId, { transaction });
      if (!user) throw new Error("Không tìm thấy người dùng");

      // Cập nhật thông tin profile trực tiếp vào bảng user
      await models.user.update(
        {
          full_name: full_name !== undefined ? full_name : user.full_name,
          gender: gender !== undefined ? gender : user.gender,
          birthdate: birthdate !== undefined ? birthdate : user.birthdate,
        },
        { where: { user_id: userId }, transaction }
      );

      // Lấy thông tin user đã cập nhật
      const updatedUser = await models.user.findByPk(userId, {
        attributes: ["user_id", "username", "email", "role", "created_at", "full_name", "gender", "birthdate", "avatar_url"],
        transaction
      });

      await transaction.commit();
      return {
        status: "success",
        data: updatedUser,
        message: "Cập nhật hồ sơ thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi cập nhật hồ sơ: ${error.message}`);
    }
  }

  /**
   * Lấy tiến trình học tập của người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @returns {Promise<Object>} - Danh sách tiến trình học tập
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async getLearningProgress(req, userId) {
    try {
      userId = parseInt(userId);
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (req.user.user_id !== userId && req.user.role !== "admin") throw new Error("Không có quyền truy cập tiến trình học tập của người dùng này");

      const user = await models.user.findByPk(userId);
      if (!user) throw new Error("Không tìm thấy người dùng");

      const progress = await models.learningprogress.findAll({
        where: { user_id: userId },
        attributes: ["progress_id", "user_id", "lesson_type", "lesson_id", "progress_percent", "status", "last_accessed_at"],
        include: [
          {
            model: models.user,
            as: "user",
            attributes: ["user_id", "username"],
          },
          {
            model: models.lesson,
            as: "lesson",
            attributes: ["lesson_id", "title", "lesson_type"],
            required: false,
            where: { lesson_id: sequelize.col("learningprogress.lesson_id") },
          },
          {
            model: models.skilllesson,
            as: "skill",
            attributes: ["skill_id", "title", "skill_type"],
            required: false,
            where: { skill_id: sequelize.col("learningprogress.lesson_id") },
          },
        ],
      });

      // Tích hợp với strengthweakness và testattempt
      const strengthsWeaknesses = await models.strengthweakness.findAll({
        where: { user_id: userId },
        attributes: ["skill_type", "strength", "weakness"],
      });

      const testAttempts = await models.testattempt.findAll({
        where: { user_id: userId },
        attributes: ["attempt_id", "quiz_id", "score", "started_at", "completed_at"],
        include: [
          {
            model: models.quiz,
            as: "quiz",
            attributes: ["quiz_id", "title"],
          },
        ],
        order: [["completed_at", "DESC"]],
        limit: 5,
      });

      return {
        status: "success",
        data: {
          learningProgress: progress,
          strengthsWeaknesses,
          recentTestAttempts: testAttempts,
        },
        message: "Lấy tiến trình học tập thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy tiến trình học tập: ${error.message}`);
    }
  }

  /**
   * Lấy lịch sử thanh toán của người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @returns {Promise<Object>} - Danh sách lịch sử thanh toán
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async getPaymentHistory(req, userId) {
    try {
      userId = parseInt(userId);
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (req.user.user_id !== userId && req.user.role !== "admin") throw new Error("Không có quyền truy cập lịch sử thanh toán của người dùng này");

      const user = await models.user.findByPk(userId);
      if (!user) throw new Error("Không tìm thấy người dùng");

      const payments = await models.payment.findAll({
        where: { user_id: userId },
        include: [
          {
            model: models.servicepackage,
            as: "package",
            attributes: ["package_id", "name", "price"],
          },
          {
            model: models.transaction,
            as: "transactions",
            attributes: ["transaction_id", "transaction_type", "status", "reference_code", "created_at"],
          },
        ],
        order: [["paid_at", "DESC"]],
        attributes: ["payment_id", "user_id", "package_id", "amount", "status", "paid_at"],
      });

      return {
        status: "success",
        data: payments,
        message: "Lấy lịch sử thanh toán thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy lịch sử thanh toán: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách gói dịch vụ đang hoạt động của người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @returns {Promise<Object>} - Danh sách dịch vụ
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async getActiveServices(req, userId) {
    try {
      userId = parseInt(userId);
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (req.user.user_id !== userId && req.user.role !== "admin") throw new Error("Không có quyền truy cập dịch vụ của người dùng này");

      const user = await models.user.findByPk(userId);
      if (!user) throw new Error("Không tìm thấy người dùng");

      const services = await models.userservice.findAll({
        where: {
          user_id: userId,
          end_date: { [Op.gte]: new Date() },
        },
        include: [
          {
            model: models.servicepackage,
            as: "package",
            attributes: ["package_id", "name", "price", "duration_days"],
          },
        ],
        attributes: ["id", "user_id", "package_id", "start_date", "end_date"],
      });

      return {
        status: "success",
        data: services,
        message: "Lấy danh sách dịch vụ đang hoạt động thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy dịch vụ đang hoạt động: ${error.message}`);
    }
  }

  /**
   * Tìm kiếm người dùng theo username hoặc email
   * @param {Object} req - Yêu cầu HTTP
   * @param {string} searchTerm - Từ khóa tìm kiếm
   * @returns {Promise<Object>} - Danh sách người dùng khớp
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async search(req, searchTerm) {
    if (!req.user || req.user.role !== "admin") throw new Error("Quyền bị từ chối. Chỉ admin mới được thực hiện hành động này.");
    try {
      if (!searchTerm || typeof searchTerm !== "string" || searchTerm.trim() === "") {
        throw new Error("Từ khóa tìm kiếm không được để trống");
      }
      if (searchTerm.length > 100) throw new Error("Từ khóa tìm kiếm quá dài (tối đa 100 ký tự)");

      const users = await models.user.findAll({
        where: {
          [Op.or]: [
            { username: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        attributes: ["user_id", "username", "email", "role", "created_at", "full_name", "gender", "birthdate", "avatar_url"],
      });

      return {
        status: "success",
        data: users,
        message: "Tìm kiếm người dùng thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi tìm kiếm người dùng: ${error.message}`);
    }
  }

  /**
   * Upload ảnh đại diện cho người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @param {Object} fileData - Dữ liệu file ảnh từ Cloudinary
   * @returns {Promise<Object>} - URL ảnh đã upload
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async uploadAvatar(req, userId, fileData) {
    const transaction = await sequelize.transaction();
    try {
      userId = parseInt(userId);
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (req.user.user_id !== userId && req.user.role !== "admin") throw new Error("Không có quyền cập nhật ảnh đại diện của người dùng này");

      if (!fileData || !fileData.url) {
        throw new Error("Dữ liệu ảnh không hợp lệ");
      }

      const user = await models.user.findByPk(userId, { transaction });
      if (!user) throw new Error("Không tìm thấy người dùng");

      // Cập nhật avatar trực tiếp vào bảng user
      await models.user.update(
        {
          avatar_url: fileData.url,
        },
        { where: { user_id: userId }, transaction }
      );

      await transaction.commit();
      return {
        status: "success",
        data: {
          avatar_url: fileData.url,
        },
        message: "Cập nhật ảnh đại diện thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi cập nhật ảnh đại diện: ${error.message}`);
    }
  }

  /**
   * Khóa tài khoản người dùng (admin only)
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @returns {Promise<Object>} - Kết quả khóa tài khoản
   * @throws {Error} - Nếu không có quyền hoặc truy vấn thất bại
   */
  static async lockUser(req, userId) {
    const transaction = await sequelize.transaction();
    try {
      userId = parseInt(userId);
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!req.user || req.user.role !== "admin") throw new Error("Quyền bị từ chối. Chỉ admin mới được thực hiện hành động này.");

      const user = await models.user.findByPk(userId, { transaction });
      if (!user) throw new Error("Không tìm thấy người dùng");

      // Không cho phép khóa chính mình
      if (user.user_id === req.user.user_id) {
        throw new Error("Không thể khóa tài khoản của chính mình");
      }

      // Không cho phép khóa admin khác
      if (user.role === "admin") {
        throw new Error("Không thể khóa tài khoản admin khác");
      }

      // Kiểm tra xem tài khoản đã bị khóa chưa
      if (user.is_locked) {
        throw new Error("Tài khoản này đã bị khóa");
      }

      await models.user.update(
        { is_locked: true },
        { where: { user_id: userId }, transaction }
      );

      await transaction.commit();
      return {
        status: "success",
        data: { user_id: userId, is_locked: true },
        message: "Khóa tài khoản thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi khóa tài khoản: ${error.message}`);
    }
  }

  /**
   * Mở khóa tài khoản người dùng (admin only)
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @returns {Promise<Object>} - Kết quả mở khóa tài khoản
   * @throws {Error} - Nếu không có quyền hoặc truy vấn thất bại
   */
  static async unlockUser(req, userId) {
    const transaction = await sequelize.transaction();
    try {
      userId = parseInt(userId);
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!req.user || req.user.role !== "admin") throw new Error("Quyền bị từ chối. Chỉ admin mới được thực hiện hành động này.");

      const user = await models.user.findByPk(userId, { transaction });
      if (!user) throw new Error("Không tìm thấy người dùng");

      // Kiểm tra xem tài khoản có bị khóa không
      if (!user.is_locked) {
        throw new Error("Tài khoản này chưa bị khóa");
      }

      await models.user.update(
        { is_locked: false },
        { where: { user_id: userId }, transaction }
      );

      await transaction.commit();
      return {
        status: "success",
        data: { user_id: userId, is_locked: false },
        message: "Mở khóa tài khoản thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi mở khóa tài khoản: ${error.message}`);
    }
  }
}

module.exports = UserController;