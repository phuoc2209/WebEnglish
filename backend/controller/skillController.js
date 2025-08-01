const sequelize = require("../config/database");
const { Op } = require("sequelize");
const initModels = require("../models/init-models");
const models = initModels(sequelize);
const { updateStrengthWeaknessForUser } = require('./strengthWeaknessController');

/**
 * Controller quản lý bài học kỹ năng và phản hồi người dùng
 */
class SkillController {
  /**
   * Lấy danh sách bài học kỹ năng theo loại
   * @param {string} skillType - Loại kỹ năng (listening, speaking, reading, writing)
   * @returns {Promise<Object>} - Danh sách bài học kỹ năng
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getByType(skillType) {
    try {
      if (!["listening", "speaking", "reading", "writing"].includes(skillType)) {
        throw new Error("Loại kỹ năng không hợp lệ");
      }
      const skills = await models.skilllesson.findAll({
        where: { skill_type: skillType },
        attributes: ["skill_id", "title", "description", "skill_type", "reading_content", "writing_prompt", "suggested_vocabulary", "examples"],
      });
      return {
        status: "success",
        data: skills,
        message: `Lấy danh sách bài học ${skillType} thành công`,
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy bài học kỹ năng: ${error.message}`);
    }
  }

  /**
   * Tạo bài học kỹ năng mới
   * @param {Object} data - Dữ liệu bài học
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Bài học vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async create(data, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền tạo bài học");
    const t = await sequelize.transaction();
    try {
      const { title, description, skill_type, reading_content, writing_prompt, suggested_vocabulary, examples } = data;
      if (!title || !description || !skill_type) {
        throw new Error("Thiếu các trường bắt buộc: title, description, skill_type");
      }
      if (!["listening", "speaking", "reading", "writing"].includes(skill_type)) {
        throw new Error("Loại kỹ năng không hợp lệ");
      }
      if (title.length > 255) throw new Error("Tiêu đề quá dài (tối đa 255 ký tự)");

      const skill = await models.skilllesson.create(
        {
          title,
          description,
          skill_type,
          reading_content,
          writing_prompt,
          suggested_vocabulary,
          examples,
        },
        { transaction: t }
      );
      await t.commit();
      return {
        status: "success",
        data: skill,
        message: "Tạo bài học kỹ năng thành công",
      };
    } catch (error) {
      await t.rollback();
      throw new Error(`Lỗi khi tạo bài học kỹ năng: ${error.message}`);
    }
  }

  /**
   * Cập nhật bài học kỹ năng
   * @param {number} id - ID bài học kỹ năng
   * @param {Object} data - Dữ liệu cập nhật
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Bài học đã cập nhật
   * @throws {Error} - Nếu không tìm thấy hoặc truy vấn thất bại
   */
  static async update(id, data, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền cập nhật bài học");
    const t = await sequelize.transaction();
    try {
      if (!id || isNaN(id)) throw new Error("ID bài học không hợp lệ");
      const { title, description, skill_type, reading_content, writing_prompt, suggested_vocabulary, examples } = data;
      if (skill_type && !["listening", "speaking", "reading", "writing"].includes(skill_type)) {
        throw new Error("Loại kỹ năng không hợp lệ");
      }
      if (title && title.length > 255) throw new Error("Tiêu đề quá dài (tối đa 255 ký tự)");

      const [updated] = await models.skilllesson.update(
        {
          title: title || undefined,
          description: description || undefined,
          skill_type: skill_type || undefined,
          reading_content: reading_content || undefined,
          writing_prompt: writing_prompt || undefined,
          suggested_vocabulary: suggested_vocabulary || undefined,
          examples: examples || undefined,
        },
        { where: { skill_id: id }, transaction: t }
      );
      if (!updated) throw new Error("Bài học kỹ năng không tìm thấy");
      const skill = await models.skilllesson.findByPk(id, { transaction: t });
      await t.commit();
      return {
        status: "success",
        data: skill,
        message: "Cập nhật bài học kỹ năng thành công",
      };
    } catch (error) {
      await t.rollback();
      throw new Error(`Lỗi khi cập nhật bài học kỹ năng: ${error.message}`);
    }
  }

  /**
   * Xóa bài học kỹ năng
   * @param {number} id - ID bài học kỹ năng
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Kết quả xóa
   * @throws {Error} - Nếu không tìm thấy hoặc truy vấn thất bại
   */
  static async delete(id, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền xóa bài học");
    const t = await sequelize.transaction();
    try {
      if (!id || isNaN(id)) throw new Error("ID bài học không hợp lệ");
      const skill = await models.skilllesson.findByPk(id, { transaction: t });
      if (!skill) throw new Error("Bài học kỹ năng không tìm thấy");

      // Xóa các bài tập liên quan
      await models.exercise.destroy({
        where: { lesson_type: "skill", skill_id: id },
        transaction: t,
      });

      const deleted = await models.skilllesson.destroy({
        where: { skill_id: id },
        transaction: t,
      });
      if (!deleted) throw new Error("Không thể xóa bài học kỹ năng");
      await t.commit();
      return {
        status: "success",
        data: null,
        message: "Xóa bài học kỹ năng thành công",
      };
    } catch (error) {
      await t.rollback();
      throw new Error(`Lỗi khi xóa bài học kỹ năng: ${error.message}`);
    }
  }

  /**
   * Nộp phản hồi nghe của người dùng
   * @param {number} userId - ID người dùng
   * @param {number} skillId - ID bài học kỹ năng
   * @param {Object} responseData - Dữ liệu phản hồi
   * @returns {Promise<Object>} - Phản hồi vừa nộp
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async submitListeningResponse(userId, skillId, responseData) {
    const t = await sequelize.transaction();
    let submission;
    try {
      let { question, options, user_answer, is_correct, audio_file, content, score } = responseData;
      if (typeof is_correct === 'string') {
        try { is_correct = JSON.parse(is_correct); } catch (e) { }
      }
      if (score === undefined || score === null) {
        if (Array.isArray(is_correct)) {
          const total = is_correct.length;
          const correct = is_correct.filter(Boolean).length;
          score = total > 0 ? (correct / total) * 10 : 0;
        } else if (typeof is_correct === 'boolean' || typeof is_correct === 'number') {
          score = is_correct ? 1 : 0;
        }
      }
      submission = await models.skillsubmission.create(
        {
          user_id: userId,
          skill_id: skillId,
          skill_type: 'listening',
          question,
          options,
          user_answer,
          is_correct,
          audio_file,
          content,
          score,
          submitted_at: new Date(),
        },
        { transaction: t }
      );
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw new Error(`Lỗi khi nộp phản hồi listening: ${error.message}`);
    }
    // Gọi cập nhật nhận xét ngoài transaction
    try {
      await updateStrengthWeaknessForUser(userId);
    } catch (e) {
      console.error('Lỗi cập nhật nhận xét điểm mạnh/yếu:', e.message);
    }
    return {
      status: "success",
      data: submission,
      message: "Nộp phản hồi listening thành công",
    };
  }

  /**
   * Nộp phản hồi đọc của người dùng
   * @param {number} userId - ID người dùng
   * @param {number} skillId - ID bài học kỹ năng
   * @param {Object} responseData - Dữ liệu phản hồi
   * @returns {Promise<Object>} - Phản hồi vừa nộp
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async submitReadingResponse(userId, skillId, responseData) {
    const t = await sequelize.transaction();
    let submission;
    try {
      let { question, options, user_answer, is_correct, content, score } = responseData;
      if (typeof is_correct === 'string') {
        try { is_correct = JSON.parse(is_correct); } catch (e) { }
      }
      if (score === undefined || score === null) {
        if (Array.isArray(is_correct)) {
          const total = is_correct.length;
          const correct = is_correct.filter(Boolean).length;
          score = total > 0 ? (correct / total) * 10 : 0;
        } else if (typeof is_correct === 'boolean' || typeof is_correct === 'number') {
          score = is_correct ? 1 : 0;
        }
      }
      submission = await models.skillsubmission.create(
        {
          user_id: userId,
          skill_id: skillId,
          skill_type: 'reading',
          question,
          options,
          user_answer,
          is_correct,
          content,
          score,
          submitted_at: new Date(),
        },
        { transaction: t }
      );
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw new Error(`Lỗi khi nộp phản hồi reading: ${error.message}`);
    }
    try {
      await updateStrengthWeaknessForUser(userId);
    } catch (e) {
      console.error('Lỗi cập nhật nhận xét điểm mạnh/yếu:', e.message);
    }
    return {
      status: "success",
      data: submission,
      message: "Nộp phản hồi reading thành công",
    };
  }

  /**
   * Nộp bài nói của người dùng
   * @param {number} userId - ID người dùng
   * @param {number} skillId - ID bài học kỹ năng
   * @param {Object} submissionData - Dữ liệu bài nộp
   * @returns {Promise<Object>} - Bài nộp vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async submitSpeakingSubmission(userId, skillId, submissionData) {
    const t = await sequelize.transaction();
    let submission;
    try {
      let { question, options, user_answer, is_correct, audio_file, content, ai_grading_result, score } = submissionData;
      if (typeof is_correct === 'string') {
        try { is_correct = JSON.parse(is_correct); } catch (e) { }
      }
      if ((score === undefined || score === null) && ai_grading_result) {
        let aiResult = ai_grading_result;
        if (typeof aiResult === 'string') {
          try { aiResult = JSON.parse(aiResult); } catch (e) { }
        }
        if (aiResult && typeof aiResult === 'object' && aiResult.overall !== undefined) {
          score = aiResult.overall;
        }
      }
      submission = await models.skillsubmission.create(
        {
          user_id: userId,
          skill_id: skillId,
          skill_type: 'speaking',
          question,
          options,
          user_answer,
          is_correct,
          audio_file,
          content,
          ai_grading_result,
          score,
          submitted_at: new Date(),
        },
        { transaction: t }
      );
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw new Error(`Lỗi khi nộp bài speaking: ${error.message}`);
    }
    try {
      await updateStrengthWeaknessForUser(userId);
    } catch (e) {
      console.error('Lỗi cập nhật nhận xét điểm mạnh/yếu:', e.message);
    }
    return {
      status: "success",
      data: submission,
      message: "Nộp bài speaking thành công",
    };
  }

  /**
   * Nộp bài viết của người dùng
   * @param {number} userId - ID người dùng
   * @param {number} skillId - ID bài học kỹ năng
   * @param {Object} submissionData - Dữ liệu bài nộp
   * @returns {Promise<Object>} - Bài nộp vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async submitWritingSubmission(userId, skillId, submissionData) {
    const t = await sequelize.transaction();
    let submission;
    try {
      let { question, options, user_answer, is_correct, content, ai_grading_result, score } = submissionData;
      if (typeof is_correct === 'string') {
        try { is_correct = JSON.parse(is_correct); } catch (e) { }
      }
      if ((score === undefined || score === null) && ai_grading_result) {
        let aiResult = ai_grading_result;
        if (typeof aiResult === 'string') {
          try { aiResult = JSON.parse(aiResult); } catch (e) { }
        }
        if (aiResult && typeof aiResult === 'object' && aiResult.overall !== undefined) {
          score = aiResult.overall;
        }
      }
      submission = await models.skillsubmission.create(
        {
          user_id: userId,
          skill_id: skillId,
          skill_type: 'writing',
          question,
          options,
          user_answer,
          is_correct,
          content,
          ai_grading_result,
          score,
          submitted_at: new Date(),
        },
        { transaction: t }
      );
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw new Error(`Lỗi khi nộp bài writing: ${error.message}`);
    }
    try {
      await updateStrengthWeaknessForUser(userId);
    } catch (e) {
      console.error('Lỗi cập nhật nhận xét điểm mạnh/yếu:', e.message);
    }
    return {
      status: "success",
      data: submission,
      message: "Nộp bài writing thành công",
    };
  }

  /**
   * Lấy bài học kỹ năng theo ID
   * @param {number} skillId - ID bài học kỹ năng
   * @returns {Promise<Object>} - Bài học kỹ năng
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getById(skillId) {
    try {
      if (!skillId || isNaN(skillId)) throw new Error("ID bài học không hợp lệ");
      const skill = await models.skilllesson.findByPk(skillId, {
        include: [
          {
            model: models.exercise,
            as: "exercises",
            where: { lesson_type: "skill" },
            attributes: ["exercise_id", "question", "correct_answer", "options"],
            required: false,
          },
          {
            model: models.audio,
            as: "audios",
            attributes: ["audio_id", "audio_url", "title"],
            required: false,
          },
          {
            model: models.video,
            as: "videos",
            attributes: ["video_id", "video_url", "title"],
            required: false,
          },
        ],
        attributes: ["skill_id", "title", "description", "skill_type", "reading_content", "writing_prompt", "suggested_vocabulary", "examples"],
      });
      if (!skill) throw new Error("Bài học kỹ năng không tìm thấy");
      return {
        status: "success",
        data: skill,
        message: "Lấy bài học kỹ năng thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy bài học kỹ năng: ${error.message}`);
    }
  }

  /**
   * Lấy tất cả bài học kỹ năng
   * @param {Object} params - Tham số truy vấn
   * @param {number} [params.limit] - Số lượng bản ghi mỗi trang
   * @param {number} [params.offset] - Vị trí bắt đầu
   * @param {string} [params.skillType] - Loại kỹ năng
   * @returns {Promise<Object>} - Danh sách bài học kỹ năng
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getAll({ limit, offset, skillType } = {}) {
    try {
      const whereClause = {};
      if (skillType) {
        if (!["listening", "speaking", "reading", "writing"].includes(skillType)) {
          throw new Error("Loại kỹ năng không hợp lệ");
        }
        whereClause.skill_type = skillType;
      }

      const skills = await models.skilllesson.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        attributes: ["skill_id", "title", "description", "skill_type", "reading_content", "writing_prompt", "suggested_vocabulary", "examples"],
        order: [['skill_id', 'DESC']],
      });
      return {
        status: "success",
        data: skills,
        message: "Lấy danh sách bài học kỹ năng thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách bài học kỹ năng: ${error.message}`);
    }
  }
}

/**
 * Lấy điểm trung bình từng kỹ năng cho user
 * @param {number} userId
 * @returns {Promise<Object>} - {listening, speaking, reading, writing}
 */
async function getAverageScoreByUserId(userId) {
  const skills = ['listening', 'speaking', 'reading', 'writing'];
  const result = {};

  for (const skill of skills) {
    const submissions = await models.skillsubmission.findAll({
      where: { user_id: userId, skill_type: skill, score: { [Op.ne]: null } },
      attributes: ['score', 'submitted_at'],
      order: [['submitted_at', 'ASC']]
    });

    const scores = submissions.map(s => Number(s.score)).filter(s => !isNaN(s));

    if (scores.length === 0) {
      result[skill] = null;
      continue;
    }

    // Tính các chỉ số
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    // Tính độ lệch chuẩn
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Tính xu hướng (điểm cuối - điểm đầu)
    const trend = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;

    // Đánh giá độ ổn định (coefficient of variation)
    const stability = avg > 0 ? (stdDev / avg) * 100 : 0;

    result[skill] = {
      average: avg,
      max: max,
      min: min,
      trend: trend,
      stability: stability, // % - càng thấp càng ổn định
      count: scores.length,
      scores: scores
    };
  }

  return result;
}

module.exports = SkillController;
module.exports.getAverageScoreByUserId = getAverageScoreByUserId;