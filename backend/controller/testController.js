const { finished } = require("nodemailer/lib/xoauth2");
const sequelize = require("../config/database");
const initModels = require("../models/init-models");
const models = initModels(sequelize);
const XLSX = require("xlsx");

/**
 * Controller quản lý bài kiểm tra, câu hỏi, và phản hồi người dùng cho website học tiếng Anh
 */
class TestController {
  /**
   * Lấy danh sách bài kiểm tra với phân trang
   * @param {Object} params - Tham số truy vấn
   * @param {number} [params.page=1] - Số trang
   * @param {number} [params.pageSize=10] - Số bản ghi mỗi trang
   * @param {boolean} [params.isPublic] - Lọc bài kiểm tra công khai
   * @returns {Promise<Object>} - Danh sách bài kiểm tra và tổng số bản ghi
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getAllQuizzes({ page = 1, pageSize = 10, isPublic } = {}) {
    try {
      if (page < 1 || pageSize < 1) throw new Error("Page hoặc pageSize không hợp lệ");
      const where = {};
      if (isPublic !== undefined) where.is_public = isPublic;

      const quizzes = await models.quiz.findAndCountAll({
        where,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        attributes: ["quiz_id", "title", "description", "user_id", "is_public"],
        include: [
          {
            model: models.quizquestion,
            as: "quizquestions",
            attributes: ["question_id", "quiz_id", "question", "difficulty"],
            include: [
              {
                model: models.answerkey,
                as: "answerkeys",
                attributes: ["answer_id", "question_id", "option_text", "is_correct", "explanation"],
              },
            ],
          },
        ],
      });

      return {
        status: "success",
        data: {
          count: quizzes.count,
          rows: quizzes.rows,
        },
        message: "Lấy danh sách bài kiểm tra thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách bài kiểm tra: ${error.message}`);
    }
  }

  /**
   * Lấy bài kiểm tra theo ID
   * @param {number} id - ID bài kiểm tra
   * @returns {Promise<Object>} - Bài kiểm tra hoặc lỗi nếu không tìm thấy
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getQuizById(id) {
    try {
      if (!id || isNaN(id)) throw new Error("ID bài kiểm tra không hợp lệ");
      const quiz = await models.quiz.findByPk(id, {
        attributes: ["quiz_id", "title", "description", "user_id", "is_public"],
        include: [
          {
            model: models.quizquestion,
            as: "quizquestions",
            attributes: ["question_id", "quiz_id", "question", "difficulty"],
            include: [
              {
                model: models.answerkey,
                as: "answerkeys",
                attributes: ["answer_id", "option_text"],
              },
            ],
          },
        ],
      });
      if (!quiz) throw new Error("Bài kiểm tra không tìm thấy");
      return {
        status: "success",
        data: quiz,
        message: "Lấy bài kiểm tra thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy bài kiểm tra: ${error.message}`);
    }
  }

  /**
   * Tạo bài kiểm tra mới
   * @param {Object} data - Dữ liệu bài kiểm tra
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Bài kiểm tra vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async createQuiz(data, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền tạo bài kiểm tra");
    const transaction = await sequelize.transaction();
    try {
      const { title, description, is_public } = data;
      if (!title) throw new Error("Thiếu trường bắt buộc: title");
      if (title.length > 255) throw new Error("Tiêu đề quá dài (tối đa 255 ký tự)");
      if (description && description.length > 1000) throw new Error("Mô tả quá dài (tối đa 1000 ký tự)");

      const quiz = await models.quiz.create(
        {
          title,
          description: description || "",
          is_public: is_public || false,
        },
        { transaction }
      );
      await transaction.commit();
      return {
        status: "success",
        data: quiz,
        message: "Tạo bài kiểm tra thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi tạo bài kiểm tra: ${error.message}`);
    }
  }

  /**
   * Cập nhật bài kiểm tra
   * @param {number} id - ID bài kiểm tra
   * @param {Object} data - Dữ liệu cập nhật
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Bài kiểm tra đã cập nhật
   * @throws {Error} - Nếu không tìm thấy hoặc truy vấn thất bại
   */
  static async updateQuiz(id, data, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền cập nhật bài kiểm tra");
    const transaction = await sequelize.transaction();
    try {
      if (!id || isNaN(id)) throw new Error("ID bài kiểm tra không hợp lệ");

      const quiz = await models.quiz.findByPk(id, { transaction });
      if (!quiz) throw new Error("Bài kiểm tra không tìm thấy");

      const { title, description, is_public } = data;
      if (!title) throw new Error("Thiếu trường bắt buộc: title");
      if (title.length > 255) throw new Error("Tiêu đề quá dài (tối đa 255 ký tự)");
      if (description && description.length > 1000) throw new Error("Mô tả quá dài (tối đa 1000 ký tự)");

      await quiz.update(
        {
          title,
          description: description || "",
          is_public: is_public !== undefined ? is_public : quiz.is_public,
        },
        { transaction }
      );

      await transaction.commit();
      return {
        status: "success",
        data: quiz,
        message: "Cập nhật bài kiểm tra thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi cập nhật bài kiểm tra: ${error.message}`);
    }
  }

  /**
   * Xóa bài kiểm tra
   * @param {number} id - ID bài kiểm tra
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Kết quả xóa
   * @throws {Error} - Nếu không tìm thấy hoặc truy vấn thất bại
   */
  static async deleteQuiz(id, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền xóa bài kiểm tra");
    const transaction = await sequelize.transaction();
    try {
      if (!id || isNaN(id)) throw new Error("ID bài kiểm tra không hợp lệ");
      const quiz = await models.quiz.findByPk(id, { transaction });
      if (!quiz) throw new Error("Bài kiểm tra không tìm thấy");

      // Xóa các bản ghi liên quan
      const questions = await models.quizquestion.findAll({
        where: { quiz_id: id },
        attributes: ["question_id"],
        transaction,
      });
      const questionIds = questions.map((q) => q.question_id);
      if (questionIds.length > 0) {
        await models.answerkey.destroy({
          where: { question_id: questionIds },
          transaction,
        });
      }
      await models.quizquestion.destroy({
        where: { quiz_id: id },
        transaction,
      });

      // Xóa answersubmission liên quan
      const attempts = await models.testattempt.findAll({
        where: { quiz_id: id },
        attributes: ["attempt_id"],
        transaction,
      });
      const attemptIds = attempts.map((a) => a.attempt_id);
      if (attemptIds.length > 0) {
        await models.answersubmission.destroy({
          where: { attempt_id: attemptIds },
          transaction,
        });
      }

      await models.testattempt.destroy({
        where: { quiz_id: id },
        transaction,
      });

      const deleted = await models.quiz.destroy({
        where: { quiz_id: id },
        transaction,
      });
      if (!deleted) throw new Error("Không thể xóa bài kiểm tra");

      await transaction.commit();
      return {
        status: "success",
        data: null,
        message: "Xóa bài kiểm tra thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi xóa bài kiểm tra: ${error.message}`);
    }
  }

  /**
   * Lấy lịch sử làm bài kiểm tra của người dùng
   * @param {number} userId - ID người dùng
   * @param {number} [quizId] - ID bài kiểm tra (tùy chọn)
   * @returns {Promise<Object>} - Danh sách lượt làm bài
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getUserTestAttempts(userId, quizId = null) {
    try {
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      const user = await models.user.findByPk(userId);
      if (!user) throw new Error("Không tìm thấy người dùng");

      const whereClause = { user_id: userId };
      if (quizId) {
        if (isNaN(quizId)) throw new Error("ID bài kiểm tra không hợp lệ");
        whereClause.quiz_id = quizId;
      }

      const attempts = await models.testattempt.findAll({
        where: whereClause,
        include: [
          {
            model: models.quiz,
            as: "quiz",
            attributes: ["quiz_id", "title", "description"],
          },
          {
            model: models.user,
            as: "user",
            attributes: ["user_id", "username"],
          },
        ],
        order: [["started_at", "DESC"]],
        attributes: ["attempt_id", "quiz_id", "user_id", "started_at", "completed_at", "score"],
      });

      return {
        status: "success",
        data: attempts,
        message: "Lấy lịch sử làm bài kiểm tra thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy lịch sử làm bài kiểm tra: ${error.message}`);
    }
  }

  /**
   * Nộp câu trả lời cho câu hỏi
   * @param {number} attemptId - ID lượt làm bài
   * @param {number} questionId - ID câu hỏi
   * @param {string} userAnswer - Câu trả lời của người dùng
   * @returns {Promise<Object>} - Phản hồi vừa nộp
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async submitAnswer(attemptId, questionId, userAnswer) {
    const transaction = await sequelize.transaction();
    try {
      if (!attemptId || !questionId || !userAnswer) throw new Error("Thiếu các trường bắt buộc: attemptId, questionId, userAnswer");
      if (typeof userAnswer !== "string" || userAnswer.length > 255) throw new Error("Câu trả lời không hợp lệ (tối đa 255 ký tự)");

      const attempt = await models.testattempt.findByPk(attemptId, { transaction });
      if (!attempt) throw new Error("Không tìm thấy lượt làm bài");
      if (attempt.completed_at) throw new Error("Lượt làm bài đã hoàn thành");

      const question = await models.quizquestion.findByPk(questionId, { transaction });
      if (!question) throw new Error("Không tìm thấy câu hỏi");

      const correctAnswer = await models.answerkey.findOne({
        where: { question_id: questionId, is_correct: true },
        attributes: ["answer_id", "option_text"],
        transaction,
      });
      if (!correctAnswer) throw new Error("Không tìm thấy đáp án đúng cho câu hỏi");

      const isCorrect = correctAnswer.option_text === userAnswer.trim();

      const submission = await models.answersubmission.create(
        {
          attempt_id: attemptId,
          question_id: questionId,
          user_answer: userAnswer.trim(),
          is_correct: isCorrect,
        },
        { transaction }
      );

      await transaction.commit();
      return {
        status: "success",
        data: submission,
        message: "Nộp câu trả lời thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi nộp câu trả lời: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách câu trả lời đã nộp cho một lượt làm bài
   * @param {number} attemptId - ID lượt làm bài
   * @returns {Promise<Object>} - Danh sách câu trả lời
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getAnswerSubmissions(attemptId) {
    try {
      if (!attemptId || isNaN(attemptId)) throw new Error("ID lượt làm bài không hợp lệ");
      const attempt = await models.testattempt.findByPk(attemptId);
      if (!attempt) throw new Error("Không tìm thấy lượt làm bài");

      const submissions = await models.answersubmission.findAll({
        where: { attempt_id: attemptId },
        include: [
          {
            model: models.quizquestion,
            as: "question",
            attributes: ["question_id", "question", "difficulty"],
            include: [
              {
                model: models.answerkey,
                as: "answerkeys",
                attributes: ["answer_id", "option_text", "is_correct"],
              },
            ],
          },
        ],
        attributes: ["submission_id", "attempt_id", "question_id", "user_answer", "is_correct"],
      });

      return {
        status: "success",
        data: submissions,
        message: "Lấy danh sách câu trả lời thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách câu trả lời: ${error.message}`);
    }
  }

  /**
   * Tính điểm bài kiểm tra
   * @param {number} attemptId - ID lượt làm bài
   * @returns {Promise<Object>} - Kết quả điểm số
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async calculateTestScore(attemptId) {
    const transaction = await sequelize.transaction();
    try {
      if (!attemptId || isNaN(attemptId)) throw new Error("ID lượt làm bài không hợp lệ");
      const attempt = await models.testattempt.findByPk(attemptId, { transaction });
      if (!attempt) throw new Error("Không tìm thấy lượt làm bài");

      const submissions = await models.answersubmission.findAll({
        where: { attempt_id: attemptId },
        attributes: ["submission_id", "is_correct"],
        transaction,
      });

      const totalQuestions = submissions.length;
      const correctAnswers = submissions.filter((sub) => sub.is_correct).length;
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      await models.testattempt.update(
        {
          score: Math.round(score * 100) / 100,
          completed_at: new Date(),
        },
        { where: { attempt_id: attemptId }, transaction }
      );

      await transaction.commit();
      return {
        status: "success",
        data: {
          totalQuestions,
          correctAnswers,
          score: Math.round(score * 100) / 100,
        },
        message: "Tính điểm bài kiểm tra thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi tính điểm bài kiểm tra: ${error.message}`);
    }
  }

  /**
   * Lấy thống kê bài kiểm tra
   * @param {number} quizId - ID bài kiểm tra
   * @returns {Promise<Object>} - Thống kê bài kiểm tra
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getQuizStatistics(quizId) {
    try {
      if (!quizId || isNaN(quizId)) throw new Error("ID bài kiểm tra không hợp lệ");
      const quiz = await models.quiz.findByPk(quizId);
      if (!quiz) throw new Error("Không tìm thấy bài kiểm tra");

      const stats = await models.testattempt.findAll({
        where: { quiz_id: quizId },
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("attempt_id")), "total_attempts"],
          [sequelize.fn("COUNT", sequelize.fn("DISTINCT", sequelize.col("user_id"))), "unique_users"],
          [sequelize.fn("AVG", sequelize.col("score")), "average_score"],
        ],
      });

      return {
        status: "success",
        data: {
          total_attempts: Number(stats[0].dataValues.total_attempts) || 0,
          unique_users: Number(stats[0].dataValues.unique_users) || 0,
          average_score: stats[0].dataValues.average_score ? Number(stats[0].dataValues.average_score).toFixed(2) : null,
        },
        message: "Lấy thống kê bài kiểm tra thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy thống kê bài kiểm tra: ${error.message}`);
    }
  }

  /**
   * Tạo bài kiểm tra ngẫu nhiên với số lượng câu hỏi theo độ khó
   * @param {Object} params - Tham số
   * @param {number} [params.easy=5] - Số câu hỏi dễ
   * @param {number} [params.medium=3] - Số câu hỏi trung bình
   * @param {number} [params.hard=2] - Số câu hỏi khó
   * @returns {Promise<Object>} - Danh sách câu hỏi ngẫu nhiên
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async generateRandomQuiz({ easy = 5, medium = 3, hard = 2 } = {}) {
    try {
      if (easy < 0 || medium < 0 || hard < 0) throw new Error("Số lượng câu hỏi không hợp lệ");
      const totalQuestions = easy + medium + hard;
      if (totalQuestions === 0) throw new Error("Phải chọn ít nhất một câu hỏi");

      const easyQuestions = await models.quizquestion.findAll({
        where: { difficulty: "easy" },
        order: sequelize.random(),
        limit: easy,
        attributes: ["question_id", "question", "difficulty"],
        include: [{ model: models.answerkey, as: "answerkeys", attributes: ["answer_id", "option_text"] }],
      });

      const mediumQuestions = await models.quizquestion.findAll({
        where: { difficulty: "medium" },
        order: sequelize.random(),
        limit: medium,
        attributes: ["question_id", "question", "difficulty"],
        include: [{ model: models.answerkey, as: "answerkeys", attributes: ["answer_id", "option_text"] }],
      });

      const hardQuestions = await models.quizquestion.findAll({
        where: { difficulty: "hard" },
        order: sequelize.random(),
        limit: hard,
        attributes: ["question_id", "question", "difficulty"],
        include: [{ model: models.answerkey, as: "answerkeys", attributes: ["answer_id", "option_text"] }],
      });

      const availableQuestions = {
        easy: easyQuestions.length,
        medium: mediumQuestions.length,
        hard: hardQuestions.length,
      };
      if (easy > availableQuestions.easy || medium > availableQuestions.medium || hard > availableQuestions.hard) {
        throw new Error(
          `Không đủ câu hỏi: Yêu cầu {easy: ${easy}, medium: ${medium}, hard: ${hard}}, Có sẵn {easy: ${availableQuestions.easy}, medium: ${availableQuestions.medium}, hard: ${availableQuestions.hard}}`
        );
      }

      const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
      for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
      }

      return {
        status: "success",
        data: allQuestions,
        message: "Tạo bài kiểm tra ngẫu nhiên thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi tạo bài kiểm tra ngẫu nhiên: ${error.message}`);
    }
  }

  /**
   * Nhập bài kiểm tra từ file Excel
   * @param {Object} file - File Excel được tải lên
   * @param {Object} quizData - Dữ liệu bài kiểm tra
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Bài kiểm tra vừa nhập
   * @throws {Error} - Nếu file không hợp lệ hoặc truy vấn thất bại
   */
  static async importQuizFromExcel(file, quizData, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền nhập bài kiểm tra");
    const transaction = await sequelize.transaction();
    try {
      if (!file || !file.buffer) throw new Error("Không có file được tải lên");
      if (!file.mimetype.includes("spreadsheet") && !file.originalname.match(/\.(xlsx|xls)$/)) {
        throw new Error("Vui lòng tải lên file Excel (.xlsx hoặc .xls)");
      }
      const { title, description, is_public, user_id } = quizData;
      if (!title) throw new Error("Thiếu trường bắt buộc: title");
      if (title.length > 255) throw new Error("Tiêu đề quá dài (tối đa 255 ký tự)");
      if (description && description.length > 1000) throw new Error("Mô tả quá dài (tối đa 1000 ký tự)");
      if (!user_id || isNaN(user_id)) throw new Error("Thiếu hoặc ID người dùng không hợp lệ");

      const validation = await this.validateQuizExcel(file);
      if (!validation.data.isValid) {
        throw new Error(`File Excel không hợp lệ: ${JSON.stringify(validation.data.errors)}`);
      }

      console.log('📝 Bắt đầu import quiz:', title);
      console.log('📊 Số câu hỏi sẽ import:', validation.data.questions.length);

      const quiz = await models.quiz.create(
        {
          title: title || "Bài kiểm tra nhập từ Excel",
          description: description || "Được nhập từ file Excel",
          skill_type: 'grammar', // Mặc định là grammar
          is_public: is_public || false,
          user_id: parseInt(user_id),
        },
        { transaction }
      );
      console.log('✅ Đã tạo quiz với ID:', quiz.quiz_id);

      for (const row of validation.data.questions) {
        console.log('📝 Đang tạo câu hỏi:', row.question);
        const question = await models.quizquestion.create(
          {
            quiz_id: quiz.quiz_id,
            question: row.question,
            difficulty: row.difficulty,
          },
          { transaction }
        );
        console.log('✅ Đã tạo câu hỏi với ID:', question.question_id);

        for (const option of row.options) {
          console.log('📝 Đang tạo đáp án:', option.text, 'isCorrect:', option.isCorrect);
          await models.answerkey.create(
            {
              question_id: question.question_id,
              option_text: option.text,
              is_correct: option.isCorrect,
            },
            { transaction }
          );
        }
        console.log('✅ Đã tạo xong đáp án cho câu hỏi:', question.question_id);
      }

      const fullQuiz = await models.quiz.findByPk(quiz.quiz_id, {
        include: [{ model: models.quizquestion, as: 'quizquestions', include: [{ model: models.answerkey, as: 'answerkeys' }] }],
        transaction,
      });

      await transaction.commit();
      return {
        status: "success",
        data: fullQuiz,
        message: "Nhập bài kiểm tra từ Excel thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi nhập bài kiểm tra từ Excel: ${error.message}`);
    }
  }

  /**
   * Validate file Excel chứa quiz
   * @param {Object} file - File Excel được tải lên
   * @returns {Promise<Object>} - Kết quả validate
   * @throws {Error} - Nếu file không hợp lệ
   */
  static async validateQuizExcel(file) {
    try {
      if (!file || !file.buffer) {
        throw new Error("Không có file được tải lên");
      }

      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      if (sheetName !== 'Quiz Questions') {
        throw new Error("Sheet phải được đặt tên là 'Quiz Questions'");
      }
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const expectedHeaders = ['Question', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Correct Answer', 'Difficulty'];
      const headers = rows[0];
      if (!headers || !expectedHeaders.every(h => headers.includes(h))) {
        throw new Error("File Excel thiếu cột bắt buộc: " + expectedHeaders.join(', '));
      }

      const questions = [];
      const errors = [];
      const validDifficulties = ['easy', 'medium', 'hard'];
      const validAnswers = ['A', 'B', 'C', 'D'];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const questionData = {
          question: row[headers.indexOf('Question')],
          option1: row[headers.indexOf('Option 1')],
          option2: row[headers.indexOf('Option 2')],
          option3: row[headers.indexOf('Option 3')],
          option4: row[headers.indexOf('Option 4')],
          correctAnswer: row[headers.indexOf('Correct Answer')],
          difficulty: row[headers.indexOf('Difficulty')],
        };

        console.log(`📊 Dòng ${i + 1}:`, questionData);

        if (!questionData.question) {
          errors.push(`Dòng ${i + 1}: Thiếu câu hỏi`);
          continue;
        }
        if (!questionData.option1 || !questionData.option2 || !questionData.option3 || !questionData.option4) {
          errors.push(`Dòng ${i + 1}: Thiếu đáp án`);
          continue;
        }
        if (!validAnswers.includes(questionData.correctAnswer)) {
          errors.push(`Dòng ${i + 1}: Đáp án đúng phải là A, B, C hoặc D`);
          continue;
        }
        if (!validDifficulties.includes(questionData.difficulty)) {
          errors.push(`Dòng ${i + 1}: Độ khó phải là easy, medium hoặc hard`);
          continue;
        }

        const options = [
          { text: questionData.option1, isCorrect: questionData.correctAnswer === 'A' },
          { text: questionData.option2, isCorrect: questionData.correctAnswer === 'B' },
          { text: questionData.option3, isCorrect: questionData.correctAnswer === 'C' },
          { text: questionData.option4, isCorrect: questionData.correctAnswer === 'D' },
        ];

        questions.push({
          question: questionData.question,
          difficulty: questionData.difficulty,
          options,
        });
      }

      console.log('📋 Tổng số câu hỏi hợp lệ:', questions.length);
      console.log('❌ Số lỗi:', errors.length);

      if (questions.length === 0) {
        throw new Error("File Excel không chứa câu hỏi hợp lệ");
      }

      return {
        status: "success",
        data: {
          isValid: errors.length === 0,
          errors,
          questions,
        },
      };
    } catch (error) {
      throw new Error(`Lỗi khi validate file Excel: ${error.message}`);
    }
  }

  /**
   * Tạo lượt làm bài kiểm tra mới
   * @param {number} userId - ID người dùng
   * @param {number} quizId - ID bài kiểm tra
   * @returns {Promise<Object>} - Lượt làm bài vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async createTestAttempt(userId, quizId) {
    const transaction = await sequelize.transaction();
    try {
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!quizId || isNaN(quizId)) throw new Error("ID bài kiểm tra không hợp lệ");

      const user = await models.user.findByPk(userId, { transaction });
      if (!user) throw new Error("Không tìm thấy người dùng");

      const quiz = await models.quiz.findByPk(quizId, { transaction });
      if (!quiz) throw new Error("Không tìm thấy bài kiểm tra");

      const attempt = await models.testattempt.create(
        {
          user_id: userId,
          quiz_id: quizId,
          started_at: new Date(),
          score: null,
          completed_at: null,
        },
        { transaction }
      );

      await transaction.commit();
      return {
        status: "success",
        data: attempt,
        message: "Tạo lượt làm bài kiểm tra thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi tạo lượt làm bài kiểm tra: ${error.message}`);
    }
  }

  /**
   * Tạo bài kiểm tra với câu hỏi ngẫu nhiên
   * @param {Object} data - Dữ liệu bài kiểm tra
   * @param {Object} questionsConfig - Cấu hình số câu hỏi theo độ khó
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Bài kiểm tra vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async createQuizWithRandomQuestions(data, questionsConfig, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền tạo bài kiểm tra");
    const transaction = await sequelize.transaction();
    try {
      const { title, description, is_public, user_id } = data;
      if (!title) throw new Error("Thiếu trường bắt buộc: title");
      if (title.length > 255) throw new Error("Tiêu đề quá dài (tối đa 255 ký tự)");
      if (description && description.length > 1000) throw new Error("Mô tả quá dài (tối đa 1000 ký tự)");

      // Tạo quiz
      const quiz = await models.quiz.create(
        {
          title,
          description: description || "",
          skill_type: 'grammar',
          is_public: is_public || false,
          user_id: user_id || 1,
        },
        { transaction }
      );

      // Generate random questions
      const { easy = 0, medium = 0, hard = 0 } = questionsConfig;
      const totalQuestions = easy + medium + hard;

      if (totalQuestions === 0) {
        throw new Error("Phải chọn ít nhất một câu hỏi");
      }

      const randomQuestions = await this.generateRandomQuiz({ easy, medium, hard });

      // Copy questions to new quiz
      for (const questionData of randomQuestions.data) {
        const newQuestion = await models.quizquestion.create(
          {
            quiz_id: quiz.quiz_id,
            question: questionData.question,
            difficulty: questionData.difficulty,
          },
          { transaction }
        );

        // Copy answer keys
        for (const answerData of questionData.answerkeys) {
          await models.answerkey.create(
            {
              question_id: newQuestion.question_id,
              option_text: answerData.option_text,
              is_correct: answerData.is_correct,
            },
            { transaction }
          );
        }
      }

      const fullQuiz = await models.quiz.findByPk(quiz.quiz_id, {
        include: [{ model: models.quizquestion, as: 'quizquestions', include: [{ model: models.answerkey, as: 'answerkeys' }] }],
        transaction,
      });

      await transaction.commit();
      return {
        status: "success",
        data: fullQuiz,
        message: `Tạo bài kiểm tra thành công với ${totalQuestions} câu hỏi ngẫu nhiên`,
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi tạo bài kiểm tra: ${error.message}`);
    }
  }
}

module.exports = TestController;