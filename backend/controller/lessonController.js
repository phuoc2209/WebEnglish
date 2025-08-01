const sequelize = require("../config/database");
const initModels = require("../models/init-models");
const models = initModels(sequelize);

/**
 * Controller quản lý bài học, bài tập và chủ đề cho website học tiếng Anh
 */
class LessonController {
  /**
   * Lấy danh sách bài học ngữ pháp với phân trang
   * @param {Object} params - Tham số truy vấn
   * @param {number} [params.limit] - Số lượng bản ghi mỗi trang
   * @param {number} [params.offset] - Vị trí bắt đầu
   * @returns {Promise<Object>} - Danh sách bài học và tổng số bản ghi
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getAllGrammarLessons({ limit, offset } = {}) {
    try {
      // Lấy tất cả bài học ngữ pháp
      const grammarLessons = await models.lesson.findAndCountAll({
        where: { lesson_type: 'grammar' },
        limit,
        offset,
        attributes: ["lesson_id", "title", "content", "meaning", "usage", "examples"],
      });
      // Lấy số lượng bài tập cho từng bài học ngữ pháp
      const lessonIds = grammarLessons.rows.map(l => l.lesson_id);
      const exercises = await models.exercise.findAll({
        where: { lesson_type: 'grammar', lesson_id: lessonIds },
        attributes: ['lesson_id'],
      });
      // Đếm số lượng bài tập theo lesson_id
      const exerciseCountMap = {};
      exercises.forEach(e => {
        const lid = e.lesson_id;
        exerciseCountMap[lid] = (exerciseCountMap[lid] || 0) + 1;
      });
      // Gắn số lượng bài tập vào từng bài học
      const lessonsWithCount = grammarLessons.rows.map(lesson => {
        const obj = lesson.toJSON();
        obj.exercise_count = exerciseCountMap[lesson.lesson_id] || 0;
        return obj;
      });
      return {
        status: "success",
        data: {
          count: grammarLessons.count,
          rows: lessonsWithCount,
        },
        message: "Lấy danh sách bài học ngữ pháp thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách bài học ngữ pháp: ${error.message}`);
    }
  }

  /**
   * Lấy bài học ngữ pháp theo ID
   * @param {number} lessonId - ID bài học ngữ pháp
   * @returns {Promise<Object>} - Bài học ngữ pháp hoặc lỗi nếu không tìm thấy
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getGrammarLessonById(lessonId) {
    try {
      if (!lessonId || isNaN(lessonId)) throw new Error("ID bài học không hợp lệ");
      const lesson = await models.lesson.findOne({
        where: { lesson_id: lessonId, lesson_type: 'grammar' },
        include: [
          {
            model: models.exercise,
            as: "exercises",
            where: { lesson_type: "grammar", lesson_id: lessonId },
            attributes: ["exercise_id", "question", "correct_answer", "options"],
            required: false,
          },
        ],
        attributes: ["lesson_id", "title", "content", "meaning", "usage", "examples"],
      });
      if (!lesson) throw new Error("Bài học ngữ pháp không tìm thấy");
      return {
        status: "success",
        data: lesson,
        message: "Lấy bài học ngữ pháp thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy bài học ngữ pháp: ${error.message}`);
    }
  }

  /**
   * Tạo bài học ngữ pháp mới
   * @param {Object} lessonData - Dữ liệu bài học
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Bài học vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async createGrammarLesson(lessonData, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền tạo bài học");
    const t = await sequelize.transaction();
    try {
      if (!lessonData.title || !lessonData.content) {
        throw new Error("Thiếu các trường bắt buộc: title, content");
      }
      const { questions, ...lessonFields } = lessonData;
      const newLesson = await models.lesson.create({
        ...lessonFields,
        lesson_type: 'grammar'
      }, { transaction: t });
      if (questions && Array.isArray(questions)) {
        console.log('Questions to insert:', questions);
        for (const q of questions) {
          console.log('Inserting exercise:', q);
          await models.exercise.create({
            lesson_id: newLesson.lesson_id,
            lesson_type: 'grammar',
            question: q.question,
            options: JSON.stringify(q.options),
            correct_answer: q.correct_answer
          }, { transaction: t });
        }
      }
      await t.commit();
      return {
        status: "success",
        data: newLesson,
        message: "Tạo bài học ngữ pháp thành công",
      };
    } catch (error) {
      await t.rollback();
      throw new Error(`Lỗi khi tạo bài học ngữ pháp: ${error.message}`);
    }
  }

  /**
   * Cập nhật bài học ngữ pháp
   * @param {number} lessonId - ID bài học ngữ pháp
   * @param {Object} lessonData - Dữ liệu cập nhật
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Bài học đã cập nhật
   * @throws {Error} - Nếu không tìm thấy hoặc truy vấn thất bại
   */
  static async updateGrammarLesson(lessonId, lessonData, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền cập nhật bài học");
    try {
      if (!lessonId || isNaN(lessonId)) throw new Error("ID bài học không hợp lệ");
      const [updated] = await models.lesson.update(lessonData, {
        where: { lesson_id: lessonId, lesson_type: 'grammar' },
      });
      if (!updated) throw new Error("Bài học ngữ pháp không tìm thấy");
      const updatedLesson = await models.lesson.findByPk(lessonId);
      return {
        status: "success",
        data: updatedLesson,
        message: "Cập nhật bài học ngữ pháp thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật bài học ngữ pháp: ${error.message}`);
    }
  }

  /**
   * Xóa bài học ngữ pháp
   * @param {number} lessonId - ID bài học ngữ pháp
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Kết quả xóa
   * @throws {Error} - Nếu không tìm thấy hoặc truy vấn thất bại
   */
  static async deleteGrammarLesson(lessonId, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền xóa bài học");
    try {
      if (!lessonId || isNaN(lessonId)) throw new Error("ID bài học không hợp lệ");
      const deleted = await models.lesson.destroy({
        where: { lesson_id: lessonId, lesson_type: 'grammar' },
      });
      if (!deleted) throw new Error("Bài học ngữ pháp không tìm thấy");
      return {
        status: "success",
        data: null,
        message: "Xóa bài học ngữ pháp thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi xóa bài học ngữ pháp: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách bài học từ vựng với phân trang
   * @param {Object} params - Tham số truy vấn
   * @param {number} [params.limit] - Số lượng bản ghi mỗi trang
   * @param {number} [params.offset] - Vị trí bắt đầu
   * @returns {Promise<Object>} - Danh sách bài học và tổng số bản ghi
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getAllVocabularyLessons({ limit, offset } = {}) {
    try {
      // Lấy tất cả bài học từ vựng
      const vocabLessons = await models.lesson.findAndCountAll({
        where: { lesson_type: 'vocabulary' },
        limit,
        offset,
        attributes: ["lesson_id", "title", "content", "meaning", "usage", "examples"],
      });
      // Lấy số lượng bài tập cho từng bài học
      const lessonIds = vocabLessons.rows.map(l => l.lesson_id);
      const exercises = await models.exercise.findAll({
        where: { lesson_type: 'vocab', lesson_id: lessonIds },
        attributes: ['lesson_id'],
      });
      // Đếm số lượng bài tập theo lesson_id
      const exerciseCountMap = {};
      exercises.forEach(e => {
        const lid = e.lesson_id;
        exerciseCountMap[lid] = (exerciseCountMap[lid] || 0) + 1;
      });
      // Gắn số lượng bài tập vào từng bài học
      const lessonsWithCount = vocabLessons.rows.map(lesson => {
        const obj = lesson.toJSON();
        obj.exercise_count = exerciseCountMap[lesson.lesson_id] || 0;
        return obj;
      });
      return {
        status: "success",
        data: {
          count: vocabLessons.count,
          rows: lessonsWithCount,
        },
        message: "Lấy danh sách bài học từ vựng thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách bài học từ vựng: ${error.message}`);
    }
  }

  /**
   * Lấy bài học từ vựng theo ID
   * @param {number} lessonId - ID bài học từ vựng
   * @returns {Promise<Object>} - Bài học từ vựng hoặc lỗi nếu không tìm thấy
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getVocabularyLessonById(lessonId) {
    try {
      if (!lessonId || isNaN(lessonId)) throw new Error("ID bài học không hợp lệ");
      const vocabLesson = await models.lesson.findOne({
        where: { lesson_id: lessonId, lesson_type: 'vocabulary' },
        attributes: ["lesson_id", "title", "content", "meaning", "usage", "examples"],
      });
      if (!vocabLesson) throw new Error("Bài học từ vựng không tìm thấy");
      // Lấy exercises liên quan với lesson_type: 'vocab'
      const exercises = await models.exercise.findAll({
        where: { lesson_id: lessonId, lesson_type: 'vocab' },
        attributes: ["exercise_id", "question", "options", "correct_answer"],
      });
      // Gắn exercises vào object trả về
      const lessonWithExercises = {
        ...vocabLesson.toJSON(),
        exercises: exercises || [],
      };
      return {
        status: "success",
        data: lessonWithExercises,
        message: "Lấy bài học từ vựng thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy bài học từ vựng: ${error.message}`);
    }
  }

  /**
   * Tạo bài học từ vựng mới
   * @param {Object} lessonData - Dữ liệu bài học
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Bài học vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async createVocabularyLesson(lessonData, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền tạo bài học");
    const t = await sequelize.transaction();
    try {
      if (!lessonData.title || !lessonData.content) {
        throw new Error("Thiếu các trường bắt buộc: title, content");
      }
      const { questions, ...lessonFields } = lessonData;
      const newLesson = await models.lesson.create({
        ...lessonFields,
        lesson_type: 'vocabulary'
      }, { transaction: t });
      if (questions && Array.isArray(questions)) {
        console.log('Questions to insert:', questions);
        for (const q of questions) {
          console.log('Inserting exercise:', q);
          await models.exercise.create({
            lesson_id: newLesson.lesson_id,
            lesson_type: 'vocabulary',
            question: q.question,
            options: JSON.stringify(q.options),
            correct_answer: q.correct_answer
          }, { transaction: t });
        }
      }
      await t.commit();
      return {
        status: "success",
        data: newLesson,
        message: "Tạo bài học từ vựng thành công",
      };
    } catch (error) {
      await t.rollback();
      throw new Error(`Lỗi khi tạo bài học từ vựng: ${error.message}`);
    }
  }

  /**
   * Cập nhật bài học từ vựng
   * @param {number} lessonId - ID bài học từ vựng
   * @param {Object} lessonData - Dữ liệu cập nhật
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Bài học đã cập nhật
   * @throws {Error} - Nếu không tìm thấy hoặc truy vấn thất bại
   */
  static async updateVocabularyLesson(lessonId, lessonData, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền cập nhật bài học");
    try {
      if (!lessonId || isNaN(lessonId)) throw new Error("ID bài học không hợp lệ");
      const [updated] = await models.lesson.update(lessonData, {
        where: { lesson_id: lessonId, lesson_type: 'vocabulary' },
      });
      if (!updated) throw new Error("Bài học từ vựng không tìm thấy");
      const updatedLesson = await models.lesson.findByPk(lessonId);
      return {
        status: "success",
        data: updatedLesson,
        message: "Cập nhật bài học từ vựng thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật bài học từ vựng: ${error.message}`);
    }
  }

  /**
   * Xóa bài học từ vựng
   * @param {number} lessonId - ID bài học từ vựng
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Kết quả xóa
   * @throws {Error} - Nếu không tìm thấy hoặc truy vấn thất bại
   */
  static async deleteVocabularyLesson(lessonId, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền xóa bài học");
    const t = await sequelize.transaction();
    try {
      if (!lessonId || isNaN(lessonId)) throw new Error("ID bài học không hợp lệ");
      // Lấy tất cả exercise_id liên quan
      const exercises = await models.exercise.findAll({ where: { lesson_id: lessonId }, attributes: ['exercise_id'], transaction: t });
      const exerciseIds = exercises.map(e => e.exercise_id);
      // Xóa exercisesubmission nếu có
      if (exerciseIds.length > 0 && models.exercisesubmission) {
        await models.exercisesubmission.destroy({ where: { exercise_id: exerciseIds }, transaction: t });
      }
      // Xóa exercise
      await models.exercise.destroy({ where: { lesson_id: lessonId }, transaction: t });
      // Xóa lesson
      const deleted = await models.lesson.destroy({ where: { lesson_id: lessonId, lesson_type: 'vocabulary' }, transaction: t });
      await t.commit();
      if (!deleted) throw new Error("Bài học từ vựng không tìm thấy");
      return {
        status: "success",
        data: null,
        message: "Xóa bài học từ vựng thành công",
      };
    } catch (error) {
      await t.rollback();
      throw new Error(`Lỗi khi xóa bài học từ vựng: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách tất cả bài tập với phân trang
   * @param {Object} params - Tham số truy vấn
   * @param {number} [params.limit] - Số lượng bản ghi mỗi trang
   * @param {number} [params.offset] - Vị trí bắt đầu
   * @returns {Promise<Object>} - Danh sách bài tập và tổng số bản ghi
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getAllExercises({ limit, offset } = {}) {
    try {
      const exercises = await models.exercise.findAndCountAll({
        include: [
          { model: models.lesson, as: "lesson", attributes: ["lesson_id", "title"], required: false },
          { model: models.skilllesson, as: "skill", attributes: ["skill_id", "title"], required: false }
        ],
        limit,
        offset,
        attributes: ["exercise_id", "lesson_type", "lesson_id", "skill_id", "question", "correct_answer", "options"],
      });
      return {
        status: "success",
        data: exercises,
        message: "Lấy danh sách bài tập thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách bài tập: ${error.message}`);
    }
  }

  /**
   * Lấy bài tập theo ID
   * @param {number} exerciseId - ID bài tập
   * @returns {Promise<Object>} - Bài tập hoặc lỗi nếu không tìm thấy
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getExerciseById(exerciseId) {
    try {
      if (!exerciseId || isNaN(exerciseId)) throw new Error("ID bài tập không hợp lệ");
      const exercise = await models.exercise.findByPk(exerciseId, {
        include: [
          { model: models.lesson, as: "lesson", attributes: ["lesson_id", "title"], required: false },
          { model: models.skilllesson, as: "skill", attributes: ["skill_id", "title"], required: false }
        ],
        attributes: ["exercise_id", "lesson_type", "lesson_id", "skill_id", "question", "correct_answer", "options"],
      });
      if (!exercise) throw new Error("Bài tập không tìm thấy");
      return {
        status: "success",
        data: exercise,
        message: "Lấy bài tập thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy bài tập: ${error.message}`);
    }
  }

  /**
   * Lấy bài tập theo loại và ID bài học
   * @param {string} lessonType - Loại bài học (grammar, vocab, skill)
   * @param {number} lessonId - ID bài học
   * @returns {Promise<Object>} - Danh sách bài tập
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getExercisesByType(lessonType, lessonId) {
    try {
      if (!lessonType || !lessonId) throw new Error("Thiếu tham số lessonType hoặc lessonId");

      const whereClause = { lesson_type: lessonType };
      if (lessonType === 'skill') {
        whereClause.skill_id = lessonId;
      } else {
        whereClause.lesson_id = lessonId;
      }

      const exercises = await models.exercise.findAll({
        where: whereClause,
        attributes: ["exercise_id", "question", "correct_answer", "options"],
      });
      return {
        status: "success",
        data: exercises,
        message: "Lấy bài tập theo loại thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy bài tập theo loại: ${error.message}`);
    }
  }

  /**
   * Tạo bài tập mới
   * @param {Object} exerciseData - Dữ liệu bài tập
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Bài tập vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async createExercise(exerciseData, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền tạo bài tập");
    try {
      if (!exerciseData.question || !exerciseData.correct_answer || !exerciseData.lesson_type) {
        throw new Error("Thiếu các trường bắt buộc: question, correct_answer, lesson_type");
      }
      const newExercise = await models.exercise.create(exerciseData);
      return {
        status: "success",
        data: newExercise,
        message: "Tạo bài tập thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi tạo bài tập: ${error.message}`);
    }
  }

  /**
   * Cập nhật bài tập
   * @param {number} exerciseId - ID bài tập
   * @param {Object} exerciseData - Dữ liệu cập nhật
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Bài tập đã cập nhật
   * @throws {Error} - Nếu không tìm thấy hoặc truy vấn thất bại
   */
  static async updateExercise(exerciseId, exerciseData, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền cập nhật bài tập");
    try {
      if (!exerciseId || isNaN(exerciseId)) throw new Error("ID bài tập không hợp lệ");
      const [updated] = await models.exercise.update(exerciseData, {
        where: { exercise_id: exerciseId },
      });
      if (!updated) throw new Error("Bài tập không tìm thấy");
      const updatedExercise = await models.exercise.findByPk(exerciseId);
      return {
        status: "success",
        data: updatedExercise,
        message: "Cập nhật bài tập thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật bài tập: ${error.message}`);
    }
  }

  /**
   * Xóa bài tập
   * @param {number} exerciseId - ID bài tập
   * @param {string} userRole - Vai trò người dùng
   * @returns {Promise<Object>} - Kết quả xóa
   * @throws {Error} - Nếu không tìm thấy hoặc truy vấn thất bại
   */
  static async deleteExercise(exerciseId, userRole) {
    if (userRole !== "admin") throw new Error("Không có quyền xóa bài tập");
    try {
      if (!exerciseId || isNaN(exerciseId)) throw new Error("ID bài tập không hợp lệ");
      const deleted = await models.exercise.destroy({
        where: { exercise_id: exerciseId },
      });
      if (!deleted) throw new Error("Bài tập không tìm thấy");
      return {
        status: "success",
        data: null,
        message: "Xóa bài tập thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi xóa bài tập: ${error.message}`);
    }
  }

  /**
   * Lưu kết quả làm bài tập (exercise) cho các bài học ngữ pháp, từ vựng, nghe, đọc
   * @param {number} userId - ID người dùng
   * @param {number} exerciseId - ID bài tập
   * @param {string} userAnswer - Đáp án người dùng chọn
   * @returns {Promise<Object>} - Kết quả lưu submission
   */
  static async submitExerciseSubmission(userId, exerciseId, userAnswer) {
    const transaction = await sequelize.transaction();
    try {
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!exerciseId || isNaN(exerciseId)) throw new Error("ID bài tập không hợp lệ");
      if (!userAnswer) throw new Error("Thiếu đáp án người dùng");

      // Lấy bài tập
      const exercise = await models.exercise.findByPk(exerciseId, { transaction });
      if (!exercise) throw new Error("Không tìm thấy bài tập");

      // Kiểm tra đáp án đúng
      const isCorrect = (userAnswer.trim() === exercise.correct_answer);

      // Lưu submission
      const submission = await models.exercisesubmission.create({
        user_id: userId,
        exercise_id: exerciseId,
        user_answer: userAnswer.trim(),
        is_correct: isCorrect,
        submitted_at: new Date(),
      }, { transaction });

      await transaction.commit();
      return {
        status: "success",
        data: submission,
        message: "Lưu kết quả bài tập thành công",
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi lưu kết quả bài tập: ${error.message}`);
    }
  }

  /**
   * Cập nhật tiến độ học tập
   * @param {Object} progressData - Dữ liệu tiến độ
   * @returns {Promise<Object>} - Kết quả cập nhật
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async updateProgress(progressData) {
    try {
      const { user_id, lesson_type, lesson_id, skill_id, status, progress_percent } = progressData;

      if (!user_id || (!lesson_id && !skill_id)) {
        throw new Error("Thiếu thông tin user_id và lesson_id hoặc skill_id");
      }

      if (!lesson_type) {
        throw new Error("Thiếu thông tin lesson_type");
      }

      const validLessonTypes = ["vocabulary", "grammar", "speaking", "listening", "reading", "writing"];
      if (!validLessonTypes.includes(lesson_type)) {
        throw new Error("Loại bài học không hợp lệ");
      }

      // Chỉ truyền skill_id nếu có, tránh undefined
      const whereClause = { user_id, lesson_type };
      if (lesson_id) whereClause.lesson_id = lesson_id;
      if (skill_id !== undefined && skill_id !== null) whereClause.skill_id = skill_id;

      const existingProgress = await models.learningprogress.findOne({
        where: whereClause
      });

      if (existingProgress) {
        await existingProgress.update({
          status,
          progress_percent: progress_percent || 0,
          last_accessed_at: new Date()
        });
      } else {
        const createData = {
          user_id,
          lesson_type,
          status: status || 'not started',
          progress_percent: progress_percent || 0,
          last_accessed_at: new Date()
        };
        if (lesson_id) createData.lesson_id = lesson_id;
        if (skill_id !== undefined && skill_id !== null) createData.skill_id = skill_id;
        await models.learningprogress.create(createData);
      }

      return {
        status: "success",
        message: "Cập nhật tiến độ học tập thành công",
      };
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật tiến độ: ${error.message}`);
    }
  }
}

module.exports = LessonController;