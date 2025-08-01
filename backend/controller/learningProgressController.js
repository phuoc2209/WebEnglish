const sequelize = require("../config/database");
const initModels = require("../models/init-models");
const models = initModels(sequelize);

/**
 * Controller quản lý tiến trình học tập của người dùng trên website học tiếng Anh
 */
class LearningProgressController {
  /**
   * Lấy danh sách tất cả tiến trình học tập (admin only)
   * @param {Object} req - Yêu cầu HTTP
   * @returns {Promise<Object>} - Danh sách tiến trình
   * @throws {Error} - Nếu không có quyền hoặc truy vấn thất bại
   */
  static async getAll(req) {
    if (!req.user || req.user.role !== "admin") throw new Error("Quyền bị từ chối. Chỉ admin mới được thực hiện hành động này.");
    try {
      const progress = await models.learningprogress.findAll({
        attributes: ["progress_id", "user_id", "lesson_type", "lesson_id", "progress_percent", "status", "last_accessed_at"],
        include: [
          {
            model: models.user,
            as: "user",
            attributes: ["user_id", "username", "email"],
          },
        ],
      });

      return {
        status: "success",
        data: progress,
        message: "Lấy danh sách tiến trình học tập thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách tiến trình: ${error.message}`);
    }
  }

  /**
   * Lấy tiến trình học tập của người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @returns {Promise<Object>} - Danh sách tiến trình
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async getByUserId(req, userId) {
    try {
      userId = parseInt(userId); // Ép kiểu ở đây
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (req.user.user_id !== userId && req.user.role !== "admin")
        throw new Error("Không có quyền truy cập tiến trình của người dùng này");

      const progress = await models.learningprogress.findAll({
        where: { user_id: userId },
        attributes: ["progress_id", "user_id", "lesson_type", "lesson_id", "progress_percent", "status", "last_accessed_at"],
        include: [
          {
            model: models.user,
            as: "user",
            attributes: ["user_id", "username"],
          },
        ],
      });

      return {
        status: "success",
        data: progress,
        message: "Lấy tiến trình học tập của người dùng thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy tiến trình của người dùng: ${error.message}`);
    }
  }


  /**
   * Lấy tiến trình học tập theo loại bài học
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @param {string} lessonType - Loại bài học
   * @returns {Promise<Object>} - Danh sách tiến trình
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async getByLessonType(req, userId, lessonType) {
    try {
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!lessonType || lessonType.trim() === "") throw new Error("Loại bài học không được để trống");
      if (req.user.user_id !== userId && req.user.role !== "admin") throw new Error("Không có quyền truy cập tiến trình của người dùng này");

      const validLessonTypes = ["vocabulary", "grammar", "speaking", "listening", "reading", "writing"];
      if (!validLessonTypes.includes(lessonType)) throw new Error("Loại bài học không hợp lệ");

      const progress = await models.learningprogress.findAll({
        where: { user_id: userId, lesson_type: lessonType },
        attributes: ["progress_id", "user_id", "lesson_type", "lesson_id", "progress_percent", "status", "last_accessed_at"],
      });

      return {
        status: "success",
        data: progress,
        message: "Lấy tiến trình theo loại bài học thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy tiến trình theo loại bài học: ${error.message}`);
    }
  }

  /**
   * Cập nhật tiến trình học tập
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @param {string} lessonType - Loại bài học
   * @param {number} lessonId - ID bài học
   * @param {number} progressPercent - Phần trăm tiến trình
   * @returns {Promise<Object>} - Tiến trình đã cập nhật
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async updateProgress(req, userId, lessonType, lessonId, progressPercent) {
    const transaction = await sequelize.transaction();
    try {
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!lessonType || lessonType.trim() === "") throw new Error("Loại bài học không được để trống");
      if (!lessonId || isNaN(lessonId)) throw new Error("ID bài học không hợp lệ");
      if (progressPercent < 0 || progressPercent > 100 || isNaN(progressPercent)) throw new Error("Phần trăm tiến trình phải từ 0 đến 100");
      if (req.user.user_id !== userId) throw new Error("Không có quyền cập nhật tiến trình cho người dùng này");

      const validLessonTypes = ["vocabulary", "grammar", "speaking", "listening", "reading", "writing"];
      if (!validLessonTypes.includes(lessonType)) throw new Error("Loại bài học không hợp lệ");

      const user = await models.user.findByPk(userId, { transaction });
      if (!user) throw new Error("Không tìm thấy người dùng");

      const [progress, created] = await models.learningprogress.findOrCreate({
        where: { user_id: userId, lesson_type: lessonType, lesson_id: lessonId },
        defaults: {
          user_id: userId,
          lesson_type: lessonType,
          lesson_id: lessonId,
          progress_percent: progressPercent,
          status: progressPercent === 100 ? "completed" : progressPercent > 0 ? "in progress" : "not started",
          last_accessed_at: new Date(),
        },
        transaction,
      });

      if (!created) {
        await progress.update(
          {
            progress_percent: progressPercent,
            status: progressPercent === 100 ? "completed" : progressPercent > 0 ? "in progress" : "not started",
            last_accessed_at: new Date(),
          },
          { transaction }
        );
      }

      await transaction.commit();
      return {
        status: "success",
        data: progress,
        message: "Cập nhật tiến trình học tập thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi cập nhật tiến trình: ${error.message}`);
    }
  }
}

module.exports = LearningProgressController;