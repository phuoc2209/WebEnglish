const sequelize = require("../config/database");
const { Op } = require("sequelize");
const initModels = require("../models/init-models");
const models = initModels(sequelize);

/**
 * Controller quản lý điểm mạnh và điểm yếu của người dùng trên website học tiếng Anh
 */
class StrengthWeaknessController {
  /**
   * Lấy danh sách điểm mạnh/yếu của người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @returns {Promise<Object>} - Danh sách điểm mạnh/yếu
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async getByUserId(req, userId) {
    try {
      userId = parseInt(userId);
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (req.user.user_id !== userId && req.user.role !== "admin") throw new Error("Không có quyền truy cập thông tin điểm mạnh/yếu của người dùng này");

      const strengthWeaknesses = await models.strengthweakness.findAll({
        where: { user_id: userId },
        attributes: ["id", "user_id", "skill_type", "strength", "weakness"],
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
        data: strengthWeaknesses,
        message: "Lấy danh sách điểm mạnh/yếu thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy điểm mạnh/yếu: ${error.message}`);
    }
  }

  /**
   * Lấy điểm mạnh/yếu của người dùng theo kỹ năng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @param {string} skillType - Loại kỹ năng
   * @returns {Promise<Object>} - Thông tin điểm mạnh/yếu
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async getByUserAndSkill(req, userId, skillType) {
    try {
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!skillType || skillType.trim() === "") throw new Error("Loại kỹ năng không được để trống");
      if (req.user.user_id !== userId) throw new Error("Không có quyền truy cập thông tin điểm mạnh/yếu của người dùng này");

      const validSkillTypes = ["listening", "speaking", "reading", "writing"];
      if (!validSkillTypes.includes(skillType)) throw new Error("Loại kỹ năng không hợp lệ");

      const strengthWeakness = await models.strengthweakness.findOne({
        where: { user_id: userId, skill_type: skillType },
        attributes: ["id", "user_id", "skill_type", "strength", "weakness"],
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
        data: strengthWeakness || null,
        message: strengthWeakness ? "Lấy điểm mạnh/yếu theo kỹ năng thành công" : "Chưa có dữ liệu điểm mạnh/yếu cho kỹ năng này",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy điểm mạnh/yếu theo kỹ năng: ${error.message}`);
    }
  }

  /**
   * Lấy phân tích kỹ năng của người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @returns {Promise<Object>} - Phân tích kỹ năng
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async getUserSkillAnalysis(req, userId) {
    try {
      if (!userId || isNaN(userId)) {
        throw Object.assign(new Error('ID người dùng không hợp lệ'), { status: 400 });
      }
      if (req.user.user_id !== userId) {
        throw Object.assign(new Error('Không có quyền truy cập phân tích kỹ năng của người dùng này'), { status: 403 });
      }

      const user = await models.user.findByPk(userId);
      if (!user) {
        throw Object.assign(new Error('Không tìm thấy người dùng'), { status: 404 });
      }

      const validSkillTypes = ['listening', 'speaking', 'reading', 'writing'];
      const skillAnalysis = {};
      let latestUpdatedAt = null;

      for (const skillType of validSkillTypes) {
        skillAnalysis[skillType] = {
          score: 0,
          completed_quizzes: 0,
          correct_answers: 0,
          total_answers: 0,
          strengths: [],
          weaknesses: [],
          recommendation: `Luyện tập thêm kỹ năng ${skillType} để cải thiện điểm số.`,
        };

        // Lấy điểm mạnh/yếu từ bảng strengthweakness
        const strengthWeakness = await models.strengthweakness.findOne({
          where: { user_id: userId, skill_type: skillType },
          attributes: ['strength', 'weakness'],
        });

        if (strengthWeakness) {
          skillAnalysis[skillType].strengths = strengthWeakness.strength
            ? strengthWeakness.strength.split(',').map((s) => s.trim()).filter((s) => s)
            : [];
          skillAnalysis[skillType].weaknesses = strengthWeakness.weakness
            ? strengthWeakness.weakness.split(',').map((w) => w.trim()).filter((w) => w)
            : [];
          if (strengthWeakness.updated_at) {
            latestUpdatedAt = latestUpdatedAt
              ? new Date(latestUpdatedAt) > new Date(strengthWeakness.updated_at)
                ? latestUpdatedAt
                : strengthWeakness.updated_at
              : strengthWeakness.updated_at;
          }
        }

        // Lấy dữ liệu từ skillsubmission thay vì testattempt
        const skillSubmissions = await models.skillsubmission.findAll({
          where: {
            user_id: userId,
            skill_type: skillType
          },
          attributes: ['is_correct', 'submitted_at'],
        });

        const completedQuizzes = skillSubmissions.length;
        const correctAnswers = skillSubmissions.filter((sub) => sub.is_correct).length;
        const totalAnswers = skillSubmissions.length;
        const score = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

        skillAnalysis[skillType].score = score;
        skillAnalysis[skillType].completed_quizzes = completedQuizzes;
        skillAnalysis[skillType].correct_answers = correctAnswers;
        skillAnalysis[skillType].total_answers = totalAnswers;

        // Cập nhật strengths/weaknesses dựa trên score
        if (score >= 80) {
          skillAnalysis[skillType].strengths.push(`Nắm vững kỹ năng ${skillType}`);
        } else if (score < 60 && score > 0) {
          skillAnalysis[skillType].weaknesses.push(`Cần cải thiện kỹ năng ${skillType}`);
        }

        // Cập nhật latestUpdatedAt từ skillsubmission
        if (skillSubmissions.length > 0) {
          const latestSubmission = skillSubmissions.reduce((latest, current) => {
            return new Date(current.submitted_at) > new Date(latest.submitted_at) ? current : latest;
          });

          if (latestSubmission.submitted_at) {
            latestUpdatedAt = latestUpdatedAt
              ? new Date(latestUpdatedAt) > new Date(latestSubmission.submitted_at)
                ? latestUpdatedAt
                : latestSubmission.submitted_at
              : latestSubmission.submitted_at;
          }
        }
      }

      return {
        status: 'success',
        data: {
          ...skillAnalysis,
          averageScore: Object.values(skillAnalysis).reduce((sum, skill) => sum + skill.score, 0) / validSkillTypes.length,
          submissionCount: Object.values(skillAnalysis).reduce((sum, skill) => sum + skill.total_answers, 0),
          strengths: Object.keys(skillAnalysis).filter((key) => skillAnalysis[key].score >= 80),
          weaknesses: Object.keys(skillAnalysis).filter((key) => skillAnalysis[key].score < 60 && skillAnalysis[key].score > 0),
          updated_at: latestUpdatedAt ? latestUpdatedAt.toISOString() : new Date().toISOString(),
        },
        message: 'Lấy phân tích kỹ năng thành công',
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in getUserSkillAnalysis: ${error.message}`);
      throw Object.assign(error, { status: error.status || 500 });
    }
  }


  /**
   * Cập nhật hoặc tạo điểm mạnh/yếu cho người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @param {string} skillType - Loại kỹ năng
   * @param {Object} data - Dữ liệu điểm mạnh/yếu
   * @returns {Promise<Object>} - Thông tin điểm mạnh/yếu đã cập nhật
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async updateOrCreate(req, userId, skillType, data) {
    if (!req.user || req.user.role !== "admin") throw new Error("Quyền bị từ chối. Chỉ admin mới được thực hiện hành động này.");
    const transaction = await sequelize.transaction();
    try {
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!skillType || skillType.trim() === "" || skillType.length > 50) throw new Error("Loại kỹ năng không hợp lệ (tối đa 50 ký tự)");
      const { strength, weakness } = data;
      if (strength && (typeof strength !== "string" || strength.length > 1000)) throw new Error("Điểm mạnh không hợp lệ (tối đa 1000 ký tự)");
      if (weakness && (typeof weakness !== "string" || weakness.length > 1000)) throw new Error("Điểm yếu không hợp lệ (tối đa 1000 ký tự)");

      const validSkillTypes = ["listening", "speaking", "reading", "writing"];
      if (!validSkillTypes.includes(skillType)) throw new Error("Loại kỹ năng không hợp lệ");

      const user = await models.user.findByPk(userId, { transaction });
      if (!user) throw new Error("Không tìm thấy người dùng");

      const [strengthWeakness, created] = await models.strengthweakness.findOrCreate({
        where: { user_id: userId, skill_type: skillType },
        defaults: {
          user_id: userId,
          skill_type: skillType,
          strength: strength || null,
          weakness: weakness || null,
        },
        transaction,
      });

      if (!created) {
        await strengthWeakness.update(
          {
            strength: strength || null,
            weakness: weakness || null,
          },
          { transaction }
        );
      }

      await transaction.commit();
      return {
        status: "success",
        data: strengthWeakness,
        message: created ? "Tạo điểm mạnh/yếu thành công" : "Cập nhật điểm mạnh/yếu thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi cập nhật điểm mạnh/yếu: ${error.message}`);
    }
  }
}

/**
 * Cập nhật nhận xét điểm mạnh/yếu cho user dựa trên điểm trung bình từng kỹ năng
 * @param {number} userId
 */
async function updateStrengthWeaknessForUser(userId) {
  const skills = ['listening', 'speaking', 'reading', 'writing'];
  const thresholds = { listening: 8.0, reading: 8.0, speaking: 7.5, writing: 7.5 };

  for (const skill of skills) {
    // Lấy điểm số
    const submissions = await models.skillsubmission.findAll({
      where: { user_id: userId, skill_type: skill, score: { [Op.ne]: null } },
      attributes: ['score', 'submitted_at'],
      order: [['submitted_at', 'ASC']]
    });

    const scores = submissions.map(s => Number(s.score)).filter(s => !isNaN(s));

    if (scores.length === 0) {
      await models.strengthweakness.upsert({
        user_id: userId,
        skill_type: skill,
        strength: null,
        weakness: `Chưa có dữ liệu cho kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)}`
      });
      continue;
    }

    // Tính các chỉ số
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const trend = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;

    // Logic đánh giá cải tiến với ràng buộc chi tiết
    let strength = '';
    let weakness = '';

    // Định nghĩa các ngưỡng điểm
    const thresholds = { listening: 8.0, reading: 8.0, speaking: 7.5, writing: 7.5 };
    const skillThreshold = thresholds[skill];

    // Các điều kiện cơ bản
    const hasHighPotential = max >= skillThreshold;
    const isConsistent = scores.length >= 3 && Math.abs(scores[scores.length - 1] - avg) < 1.5;
    const isImproving = trend > 0.5;
    const isStable = scores.length >= 3 && Math.abs(scores[scores.length - 1] - avg) < 1.0;
    const isDeclining = trend < -0.5;

    // Các mức độ gần chuẩn
    const isVeryNearThreshold = avg >= (skillThreshold - 0.2); // Rất gần (cách 0.2 điểm)
    const isNearThreshold = avg >= (skillThreshold - 0.5); // Gần (cách 0.5 điểm)
    const isModerateNear = avg >= (skillThreshold - 1.0); // Khá gần (cách 1.0 điểm)

    // Các mức điểm cụ thể
    const isExcellent = avg >= 9.0; // Xuất sắc
    const isVeryGood = avg >= 8.5; // Rất tốt
    const isGood = avg >= skillThreshold; // Tốt (đạt chuẩn)
    const isAboveAverage = avg >= 7.0; // Trên trung bình
    const isAverage = avg >= 6.0; // Trung bình
    const isBelowAverage = avg >= 5.0; // Dưới trung bình
    const isPoor = avg < 5.0; // Yếu

    // Đánh giá độ ổn định
    const isHighlyStable = stability < 10; // Rất ổn định (< 10%)
    const isStableScore = stability < 20; // Ổn định (< 20%)
    const isUnstable = stability >= 30; // Không ổn định (≥ 30%)

    // Đánh giá xu hướng
    const isRapidlyImproving = trend > 1.5; // Cải thiện nhanh
    const isImprovingScore = trend > 0.5; // Đang cải thiện
    const isSlightlyImproving = trend > 0.2; // Cải thiện nhẹ
    const isStagnant = Math.abs(trend) <= 0.2; // Trì trệ
    const isSlightlyDeclining = trend < -0.2; // Giảm nhẹ
    const isDecliningScore = trend < -0.5; // Đang giảm

    // Logic đánh giá chi tiết theo từng mức điểm
    if (isExcellent) {
      // Xuất sắc (≥ 9.0)
      if (isHighlyStable) {
        strength = `Xuất sắc kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, rất ổn định)`;
      } else if (isRapidlyImproving) {
        strength = `Xuất sắc và đang cải thiện nhanh kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      } else {
        strength = `Xuất sắc kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      }
    } else if (isVeryGood) {
      // Rất tốt (≥ 8.5)
      if (isStableScore) {
        strength = `Rất tốt kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, ổn định)`;
      } else if (isImprovingScore) {
        strength = `Rất tốt và đang cải thiện kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      } else {
        strength = `Rất tốt kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      }
    } else if (isGood) {
      // Tốt (đạt chuẩn)
      if (isStableScore) {
        strength = `Giỏi kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, ổn định)`;
      } else if (isImprovingScore) {
        strength = `Giỏi và đang cải thiện kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      } else {
        strength = `Giỏi kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      }
    } else if (isVeryNearThreshold) {
      // Rất gần chuẩn (cách 0.2 điểm)
      if (isImprovingScore) {
        strength = `Gần đạt chuẩn giỏi kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, thiếu ${(skillThreshold - avg).toFixed(1)} điểm, đang cải thiện)`;
      } else {
        strength = `Gần đạt chuẩn giỏi kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, thiếu ${(skillThreshold - avg).toFixed(1)} điểm)`;
      }
    } else if (isNearThreshold) {
      // Gần chuẩn (cách 0.5 điểm)
      if (isImprovingScore) {
        strength = `Đang tiến gần chuẩn giỏi kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, thiếu ${(skillThreshold - avg).toFixed(1)} điểm)`;
      } else {
        strength = `Gần chuẩn giỏi kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, thiếu ${(skillThreshold - avg).toFixed(1)} điểm)`;
        weakness = `Cần luyện tập thêm một chút để đạt chuẩn giỏi`;
      }
    } else if (isModerateNear) {
      // Khá gần chuẩn (cách 1.0 điểm)
      if (isRapidlyImproving) {
        strength = `Đang cải thiện nhanh kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, thiếu ${(skillThreshold - avg).toFixed(1)} điểm)`;
      } else if (isImprovingScore) {
        strength = `Đang cải thiện kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, thiếu ${(skillThreshold - avg).toFixed(1)} điểm)`;
      } else {
        weakness = `Cần cải thiện kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, thiếu ${(skillThreshold - avg).toFixed(1)} điểm)`;
      }
    } else if (isAboveAverage) {
      // Trên trung bình (≥ 7.0)
      if (isRapidlyImproving) {
        strength = `Đang cải thiện nhanh kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      } else if (isImprovingScore) {
        strength = `Đang cải thiện kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      } else if (isStagnant) {
        weakness = `Cần luyện tập thêm kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, đang trì trệ)`;
      } else {
        weakness = `Cần cải thiện kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      }
    } else if (isAverage) {
      // Trung bình (≥ 6.0)
      if (isRapidlyImproving) {
        strength = `Đang cải thiện nhanh kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      } else if (isImprovingScore) {
        strength = `Đang cải thiện kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      } else if (isDecliningScore) {
        weakness = `Cần chú ý cải thiện kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, đang giảm)`;
      } else {
        weakness = `Cần cải thiện kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      }
    } else if (isBelowAverage) {
      // Dưới trung bình (≥ 5.0)
      if (isRapidlyImproving) {
        strength = `Đang cải thiện nhanh kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      } else if (isImprovingScore) {
        strength = `Đang cải thiện kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      } else if (isDecliningScore) {
        weakness = `Cần chú ý cải thiện kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, đang giảm)`;
      } else {
        weakness = `Cần cải thiện nhiều kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      }
    } else if (isPoor) {
      // Yếu (< 5.0)
      if (isRapidlyImproving) {
        strength = `Đang cải thiện nhanh kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      } else if (isImprovingScore) {
        strength = `Đang cải thiện kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      } else if (isDecliningScore) {
        weakness = `Cần chú ý cải thiện kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10, đang giảm)`;
      } else {
        weakness = `Cần cải thiện nhiều kỹ năng ${skill.charAt(0).toUpperCase() + skill.slice(1)} (điểm TB: ${avg.toFixed(2)}/10)`;
      }
    }

    // Lưu hoặc cập nhật vào bảng strengthweakness
    await models.strengthweakness.upsert({
      user_id: userId,
      skill_type: skill,
      strength,
      weakness
    });
  }
}

async function getAverageScoreByUserId(userId) {
  const skills = ['listening', 'speaking', 'reading', 'writing'];
  const result = {};
  for (const skill of skills) {
    const submissions = await models.skillsubmission.findAll({
      where: { user_id: userId, skill_type: skill, score: { [Op.ne]: null } },
      attributes: ['score']
    });
    const scores = submissions.map(s => Number(s.score)).filter(s => !isNaN(s));
    result[skill] = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  }
  return result;
}

module.exports = StrengthWeaknessController;
module.exports.updateStrengthWeaknessForUser = updateStrengthWeaknessForUser;