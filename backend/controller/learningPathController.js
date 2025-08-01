const sequelize = require("../config/database");
const { Op } = require("sequelize");
const initModels = require("../models/init-models");
const models = initModels(sequelize);

/**
 * Controller quản lý lộ trình học tập trên website học tiếng Anh
 */
class LearningPathController {
  /**
   * Lấy danh sách tất cả lộ trình học tập với phân trang
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} [limit=10] - Số bản ghi mỗi trang
   * @param {number} [offset=0] - Vị trí bắt đầu
   * @returns {Promise<Object>} - Danh sách lộ trình
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getAll(req, limit = 10, offset = 0) {
    try {
      if (limit < 1 || offset < 0) throw new Error("Limit hoặc offset không hợp lệ");

      const paths = await models.learningpath.findAll({
        limit,
        offset,
        attributes: ["path_id", "user_id", "path_title"],
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
        data: paths,
        message: "Lấy danh sách lộ trình học tập thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in getAll: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Lấy danh sách lộ trình học tập của người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @param {number} limit - Số lượng bản ghi
   * @param {number} offset - Vị trí bắt đầu
   * @returns {Promise<Object>} - Danh sách lộ trình
   */
  static async getByUserId(req, userId, limit = 10, offset = 0) {
    try {
      if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
      if (req.user.user_id !== userId && req.user.role !== 'admin') {
        throw Object.assign(new Error('Không có quyền truy cập lộ trình của người dùng này'), { status: 403 });
      }

      const { count, rows } = await models.learningpath.findAndCountAll({
        where: { user_id: userId },
        attributes: [
          'path_id',
          'user_id',
          'path_title',
        ],
        limit,
        offset,
      });

      return {
        status: 'success',
        data: rows,
        message: 'Lấy danh sách lộ trình của người dùng thành công',
        pagination: {
          limit,
          offset,
          total: count,
        },
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in getByUserId: ${error.message}`);
      throw Object.assign(error, { status: error.status || 500 });
    }
  }

  /**
   * Tạo lộ trình học tập được gợi ý dựa trên phân tích điểm mạnh yếu
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @returns {Promise<Object>} - Lộ trình được gợi ý
   */
  static async generateRecommendedPath(req, userId) {
    try {
      if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
      if (req.user.user_id !== userId && req.user.role !== 'admin') {
        throw Object.assign(new Error('Không có quyền truy cập lộ trình của người dùng này'), { status: 403 });
      }

      // Lấy phân tích điểm mạnh yếu
      const strengthWeakness = await models.strengthweakness.findAll({
        where: { user_id: userId },
        attributes: ['skill_type', 'strength', 'weakness']
      });

      // Lấy điểm trung bình từng kỹ năng
      const skills = ['listening', 'speaking', 'reading', 'writing'];
      const skillScores = {};

      for (const skill of skills) {
        const submissions = await models.skillsubmission.findAll({
          where: { user_id: userId, skill_type: skill, score: { [Op.ne]: null } },
          attributes: ['score'],
          order: [['submitted_at', 'DESC']],
          limit: 10
        });

        const scores = submissions.map(s => Number(s.score)).filter(s => !isNaN(s));
        skillScores[skill] = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      }

      // Định nghĩa ngưỡng điểm
      const thresholds = { listening: 8.0, reading: 8.0, speaking: 7.5, writing: 7.5 };

      // Phân tích và tạo gợi ý
      const recommendations = [];
      const prioritySkills = [];

      for (const skill of skills) {
        const score = skillScores[skill];
        const threshold = thresholds[skill];
        const strength = strengthWeakness.find(s => s.skill_type === skill);

        let priority = 0;
        let recommendation = '';

        if (score >= threshold) {
          // Đã đạt chuẩn - gợi ý bài học nâng cao
          priority = 1;
          recommendation = `Duy trì và nâng cao kỹ năng ${skill}`;
        } else if (score >= (threshold - 0.5)) {
          // Gần chuẩn - gợi ý bài học cải thiện
          priority = 3;
          recommendation = `Cải thiện kỹ năng ${skill} để đạt chuẩn`;
        } else if (score >= (threshold - 1.0)) {
          // Khá gần chuẩn - gợi ý bài học cơ bản
          priority = 4;
          recommendation = `Luyện tập kỹ năng ${skill} để tiến gần chuẩn`;
        } else {
          // Cần cải thiện nhiều - ưu tiên cao
          priority = 5;
          recommendation = `Tập trung cải thiện kỹ năng ${skill}`;
        }

        prioritySkills.push({ skill, score, priority, recommendation });
      }

      // Sắp xếp theo độ ưu tiên (cao đến thấp)
      prioritySkills.sort((a, b) => b.priority - a.priority);

      // Tạo lộ trình học tập
      const learningPath = [];
      let stepNumber = 1;

      for (const skillData of prioritySkills) {
        const { skill, score, priority, recommendation } = skillData;

        // Tìm bài học phù hợp
        const lessons = await models.skilllesson.findAll({
          where: { skill_type: skill },
          attributes: ['skill_id', 'title', 'description'],
          limit: 3,
          order: [['skill_id', 'ASC']]
        });

        // Tìm bài học grammar/vocabulary bổ trợ
        const supportLessons = await models.lesson.findAll({
          where: { lesson_type: 'grammar' },
          attributes: ['lesson_id', 'title', 'content'],
          limit: 2,
          order: [['lesson_id', 'ASC']]
        });

        // Thêm bài học kỹ năng chính
        for (const lesson of lessons) {
          learningPath.push({
            step_id: stepNumber++,
            type: 'skill',
            lesson_id: lesson.skill_id,
            title: lesson.title,
            description: lesson.description,
            skill_type: skill,
            priority: priority,
            recommendation: recommendation,
            difficulty: priority >= 4 ? 'intermediate' : 'beginner',
            estimated_time: '20 phút'
          });
        }

        // Thêm bài học bổ trợ
        for (const lesson of supportLessons) {
          learningPath.push({
            step_id: stepNumber++,
            type: 'lesson',
            lesson_id: lesson.lesson_id,
            title: lesson.title,
            description: lesson.content?.substring(0, 100) + '...',
            skill_type: 'grammar',
            priority: priority - 1,
            recommendation: `Bổ trợ ngữ pháp cho kỹ năng ${skill}`,
            difficulty: 'beginner',
            estimated_time: '15 phút'
          });
        }
      }

      // Tạo lộ trình tổng hợp
      const pathTitle = `Lộ trình cải thiện ${prioritySkills[0]?.skill || 'kỹ năng'}`;

      const newPath = await models.learningpath.create({
        user_id: userId,
        path_title: pathTitle
      });

      return {
        status: 'success',
        data: {
          path: newPath,
          steps: learningPath,
          analysis: {
            skillScores,
            prioritySkills,
            recommendations: prioritySkills.map(p => p.recommendation)
          }
        },
        message: 'Tạo lộ trình học tập được gợi ý thành công'
      };

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in generateRecommendedPath: ${error.message}`);
      throw Object.assign(error, { status: error.status || 500 });
    }
  }

  /**
   * Lấy gợi ý bài học dựa trên kỹ năng cụ thể
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @param {string} skillType - Loại kỹ năng
   * @returns {Promise<Object>} - Danh sách bài học được gợi ý
   */
  static async getSkillRecommendations(req, userId, skillType) {
    try {
      if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
      if (!skillType || !['listening', 'speaking', 'reading', 'writing'].includes(skillType)) {
        throw new Error('Loại kỹ năng không hợp lệ');
      }
      if (req.user.user_id !== userId && req.user.role !== 'admin') {
        throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
      }

      // Lấy điểm số kỹ năng
      const submissions = await models.skillsubmission.findAll({
        where: { user_id: userId, skill_type: skillType, score: { [Op.ne]: null } },
        attributes: ['score'],
        order: [['submitted_at', 'DESC']],
        limit: 10
      });

      const scores = submissions.map(s => Number(s.score)).filter(s => !isNaN(s));
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      // Định nghĩa ngưỡng điểm
      const thresholds = { listening: 8.0, reading: 8.0, speaking: 7.5, writing: 7.5 };
      const threshold = thresholds[skillType];

      // Xác định mức độ khó dựa trên điểm số
      let difficulty = 'beginner';
      let focus = '';

      if (avgScore >= threshold) {
        difficulty = 'advanced';
        focus = 'nâng cao';
      } else if (avgScore >= (threshold - 0.5)) {
        difficulty = 'intermediate';
        focus = 'cải thiện';
      } else {
        difficulty = 'beginner';
        focus = 'cơ bản';
      }

      // Tìm bài học phù hợp
      const skillLessons = await models.skilllesson.findAll({
        where: { skill_type: skillType },
        attributes: ['skill_id', 'title', 'description'],
        limit: 5,
        order: [['skill_id', 'ASC']]
      });

      // Tìm bài học bổ trợ
      const supportLessons = await models.lesson.findAll({
        where: { lesson_type: 'grammar' },
        attributes: ['lesson_id', 'title', 'content'],
        limit: 3,
        order: [['lesson_id', 'ASC']]
      });

      return {
        status: 'success',
        data: {
          skillType,
          avgScore,
          threshold,
          difficulty,
          focus,
          skillLessons,
          supportLessons,
          recommendation: `Tập trung vào bài học ${focus} kỹ năng ${skillType}`
        },
        message: 'Lấy gợi ý bài học thành công'
      };

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in getSkillRecommendations: ${error.message}`);
      throw Object.assign(error, { status: error.status || 500 });
    }
  }

  /**
   * Tìm kiếm lộ trình học tập theo tiêu đề
   * @param {Object} req - Yêu cầu HTTP
   * @param {string} title - Tiêu đề để tìm kiếm
   * @param {number} limit - Số lượng bản ghi
   * @param {number} offset - Vị trí bắt đầu
   * @returns {Promise<Object>} - Danh sách lộ trình khớp
   */
  static async searchByTitle(req, title, limit = 10, offset = 0) {
    try {
      if (!title || title.trim() === '') throw new Error('Tiêu đề tìm kiếm không được để trống');
      if (title.length > 255) throw new Error('Tiêu đề tìm kiếm quá dài (tối đa 255 ký tự)');

      // Giới hạn tìm kiếm cho admin hoặc lộ trình của chính người dùng
      const where = {
        path_title: { [Op.like]: `%${title}%` },
      };
      if (req.user.role !== 'admin') {
        where.user_id = req.user.user_id;
      }

      const { count, rows } = await models.learningpath.findAndCountAll({
        where,
        attributes: [
          'path_id',
          'user_id',
          'path_title',
        ],
        include: [
          {
            model: models.user,
            as: 'user',
            attributes: ['user_id', 'username'],
          },
        ],
        limit,
        offset,
      });

      return {
        status: 'success',
        data: rows,
        message: 'Tìm kiếm lộ trình học tập thành công',
        pagination: {
          limit,
          offset,
          total: count,
        },
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in searchByTitle: ${error.message}`);
      throw Object.assign(error, { status: error.status || 500 });
    }
  }

  /**
   * Tạo lộ trình học tập mới
   * @param {Object} req - Yêu cầu HTTP
   * @param {Object} data - Dữ liệu lộ trình
   * @returns {Promise<Object>} - Lộ trình vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async create(req, data) {
    try {
      const { user_id, title, description } = data;
      if (!user_id || isNaN(user_id)) throw new Error("ID người dùng không hợp lệ");
      if (!title || title.trim() === "") throw new Error("Tiêu đề lộ trình không được để trống");
      if (title.length > 255) throw new Error("Tiêu đề quá dài (tối đa 255 ký tự)");
      if (description && description.length > 500) throw new Error("Mô tả quá dài (tối đa 500 ký tự)");
      if (req.user.user_id !== user_id && req.user.role !== "admin") throw new Error("Không có quyền tạo lộ trình cho người dùng này");

      const user = await models.user.findByPk(user_id);
      if (!user) throw new Error("Không tìm thấy người dùng");

      const path = await models.learningpath.create({
        user_id,
        path_title: title,
      });

      return {
        status: "success",
        data: path,
        message: "Tạo lộ trình học tập thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in create: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Cập nhật lộ trình học tập
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} pathId - ID lộ trình
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} - Lộ trình đã cập nhật
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async update(req, pathId, data) {
    try {
      if (!pathId || isNaN(pathId)) throw new Error("ID lộ trình không hợp lệ");
      const { title, description } = data;
      if (title && (title.trim() === "" || title.length > 255)) throw new Error("Tiêu đề không hợp lệ (1-255 ký tự)");
      if (description && description.length > 500) throw new Error("Mô tả quá dài (tối đa 500 ký tự)");

      const path = await models.learningpath.findByPk(pathId);
      if (!path) throw new Error("Không tìm thấy lộ trình");
      if (req.user.user_id !== path.user_id && req.user.role !== "admin") throw new Error("Không có quyền cập nhật lộ trình này");

      const [updated] = await models.learningpath.update(
        {
          path_title: title || undefined,
        },
        { where: { path_id: pathId } }
      );
      if (!updated) throw new Error("Không thể cập nhật lộ trình");

      const updatedPath = await models.learningpath.findByPk(pathId);
      return {
        status: "success",
        data: updatedPath,
        message: "Cập nhật lộ trình học tập thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in update: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Xóa lộ trình học tập
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} pathId - ID lộ trình
   * @returns {Promise<Object>} - Kết quả xóa
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async delete(req, pathId) {
    const transaction = await sequelize.transaction();
    try {
      if (!pathId || isNaN(pathId)) throw new Error("ID lộ trình không hợp lệ");

      const path = await models.learningpath.findByPk(pathId, { transaction });
      if (!path) throw new Error("Không tìm thấy lộ trình");
      if (req.user.user_id !== path.user_id && req.user.role !== "admin") throw new Error("Không có quyền xóa lộ trình này");

      const deleted = await models.learningpath.destroy({ where: { path_id: pathId }, transaction });
      if (!deleted) throw new Error("Không thể xóa lộ trình");

      await transaction.commit();
      return {
        status: "success",
        data: { path_id: pathId },
        message: "Xóa lộ trình học tập thành công",
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`[${new Date().toISOString()}] Error in delete: ${error.message}`);
      throw new Error(error.message);
    }
  }
}

module.exports = LearningPathController;