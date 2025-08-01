import * as LessonModel from '../models/lesson.model';

/**
 * Controller quản lý logic bài học, bài tập
 */
export class LessonController {
  /**
   * Lấy tất cả bài học ngữ pháp
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<LessonsResponse>}
   */
  static async getAllGrammarLessons(limit = 10, offset = 0) {
    if (limit < 1 || offset < 0) throw new Error('Limit hoặc offset không hợp lệ');
    try {
      return await LessonModel.getAllGrammarLessons(limit, offset);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách bài học ngữ pháp';
      throw new Error(message);
    }
  }

  /**
   * Lấy bài học ngữ pháp theo ID
   * @param {number} lessonId
   * @returns {Promise<LessonResponse>}
   */
  static async getGrammarLessonById(lessonId) {
    if (!lessonId || isNaN(lessonId)) throw new Error('ID bài học không hợp lệ');
    try {
      return await LessonModel.getGrammarLessonById(lessonId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy bài học ngữ pháp';
      throw new Error(message);
    }
  }

  /**
   * Tạo bài học ngữ pháp mới
   * @param {{title: string, content: string, meaning?: string, usage?: string, examples?: string}} lessonData
   * @returns {Promise<LessonResponse>}
   */
  static async createGrammarLesson(lessonData) {
    if (!lessonData.title || !lessonData.content) {
      throw new Error('Thiếu các trường bắt buộc: title, content');
    }
    try {
      return await LessonModel.createGrammarLesson(lessonData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tạo bài học ngữ pháp';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật bài học ngữ pháp
   * @param {number} lessonId
   * @param {{title?: string, content?: string, meaning?: string, usage?: string, examples?: string}} lessonData
   * @returns {Promise<LessonResponse>}
   */
  static async updateGrammarLesson(lessonId, lessonData) {
    if (!lessonId || isNaN(lessonId)) throw new Error('ID bài học không hợp lệ');
    try {
      return await LessonModel.updateGrammarLesson(lessonId, lessonData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật bài học ngữ pháp';
      throw new Error(message);
    }
  }

  /**
   * Xóa bài học ngữ pháp
   * @param {number} lessonId
   * @returns {Promise<LessonResponse>}
   */
  static async deleteGrammarLesson(lessonId) {
    if (!lessonId || isNaN(lessonId)) throw new Error('ID bài học không hợp lệ');
    try {
      return await LessonModel.deleteGrammarLesson(lessonId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi xóa bài học ngữ pháp';
      throw new Error(message);
    }
  }

  /**
   * Lấy tất cả bài học từ vựng
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<LessonsResponse>}
   */
  static async getAllVocabularyLessons(limit = 10, offset = 0) {
    if (limit < 1 || offset < 0) throw new Error('Limit hoặc offset không hợp lệ');
    try {
      return await LessonModel.getAllVocabularyLessons(limit, offset);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách bài học từ vựng';
      throw new Error(message);
    }
  }

  /**
   * Lấy bài học từ vựng theo ID
   * @param {number} lessonId
   * @returns {Promise<LessonResponse>}
   */
  static async getVocabularyLessonById(lessonId) {
    if (!lessonId || isNaN(lessonId)) throw new Error('ID bài học không hợp lệ');
    try {
      return await LessonModel.getVocabularyLessonById(lessonId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy bài học từ vựng';
      throw new Error(message);
    }
  }

  /**
   * Tạo bài học từ vựng mới
   * @param {{title: string, content: string, meaning?: string, usage?: string, examples?: string}} lessonData
   * @returns {Promise<LessonResponse>}
   */
  static async createVocabularyLesson(lessonData) {
    if (!lessonData.title || !lessonData.content) {
      throw new Error('Thiếu các trường bắt buộc: title, content');
    }
    try {
      return await LessonModel.createVocabularyLesson(lessonData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tạo bài học từ vựng';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật bài học từ vựng
   * @param {number} lessonId
   * @param {{title?: string, content?: string, meaning?: string, usage?: string, examples?: string}} lessonData
   * @returns {Promise<LessonResponse>}
   */
  static async updateVocabularyLesson(lessonId, lessonData) {
    if (!lessonId || isNaN(lessonId)) throw new Error('ID bài học không hợp lệ');
    try {
      return await LessonModel.updateVocabularyLesson(lessonId, lessonData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật bài học từ vựng';
      throw new Error(message);
    }
  }

  /**
   * Xóa bài học từ vựng
   * @param {number} lessonId
   * @returns {Promise<LessonResponse>}
   */
  static async deleteVocabularyLesson(lessonId) {
    if (!lessonId || isNaN(lessonId)) throw new Error('ID bài học không hợp lệ');
    try {
      return await LessonModel.deleteVocabularyLesson(lessonId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi xóa bài học từ vựng';
      throw new Error(message);
    }
  }

  /**
   * Lấy tất cả bài tập
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<LessonsResponse>}
   */
  static async getAllExercises(limit = 10, offset = 0) {
    if (limit < 1 || offset < 0) throw new Error('Limit hoặc offset không hợp lệ');
    try {
      return await LessonModel.getAllExercises(limit, offset);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách bài tập';
      throw new Error(message);
    }
  }

  /**
   * Lấy bài tập theo ID
   * @param {number} exerciseId
   * @returns {Promise<LessonResponse>}
   */
  static async getExerciseById(exerciseId) {
    if (!exerciseId || isNaN(exerciseId)) throw new Error('ID bài tập không hợp lệ');
    try {
      return await LessonModel.getExerciseById(exerciseId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy bài tập';
      throw new Error(message);
    }
  }

  /**
   * Lấy bài tập theo loại và ID bài học
   * @param {string} lessonType
   * @param {number} lessonId
   * @returns {Promise<LessonsResponse>}
   */
  static async getExercisesByType(lessonType, lessonId) {
    if (!lessonType || !lessonId || isNaN(lessonId)) {
      throw new Error('Loại bài học hoặc ID bài học không hợp lệ');
    }
    try {
      return await LessonModel.getExercisesByType(lessonType, lessonId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy bài tập theo loại';
      throw new Error(message);
    }
  }

  /**
   * Tạo bài tập mới
   * @param {{question: string, correct_answer: string, options?: string, lesson_type: string, lesson_id?: number, skill_id?: number}} exerciseData
   * @returns {Promise<LessonResponse>}
   */
  static async createExercise(exerciseData) {
    if (!exerciseData.question || !exerciseData.correct_answer || !exerciseData.lesson_type) {
      throw new Error('Thiếu các trường bắt buộc: question, correct_answer, lesson_type');
    }
    if (!exerciseData.lesson_id && !exerciseData.skill_id) {
      throw new Error('Phải có lesson_id hoặc skill_id');
    }
    try {
      return await LessonModel.createExercise(exerciseData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tạo bài tập';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật bài tập
   * @param {number} exerciseId
   * @param {{question?: string, correct_answer?: string, options?: string, lesson_type?: string, lesson_id?: number, skill_id?: number}} exerciseData
   * @returns {Promise<LessonResponse>}
   */
  static async updateExercise(exerciseId, exerciseData) {
    if (!exerciseId || isNaN(exerciseId)) throw new Error('ID bài tập không hợp lệ');
    try {
      return await LessonModel.updateExercise(exerciseId, exerciseData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật bài tập';
      throw new Error(message);
    }
  }

  /**
   * Xóa bài tập
   * @param {number} exerciseId
   * @returns {Promise<LessonResponse>}
   */
  static async deleteExercise(exerciseId) {
    if (!exerciseId || isNaN(exerciseId)) throw new Error('ID bài tập không hợp lệ');
    try {
      return await LessonModel.deleteExercise(exerciseId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi xóa bài tập';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật tiến độ học tập
   * @param {{lesson_type: string, lesson_id?: number, skill_id?: number, progress_percent: number, status?: string}} progressData
   * @returns {Promise<{status: string, message: string}>}
   */
  static async updateProgress(progressData) {
    if (!progressData.lesson_type || !progressData.progress_percent) {
      throw new Error('Thiếu các trường bắt buộc: lesson_type, progress_percent');
    }
    if (!progressData.lesson_id && !progressData.skill_id) {
      throw new Error('Phải có lesson_id hoặc skill_id');
    }
    try {
      return await LessonModel.updateProgress(progressData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật tiến độ';
      throw new Error(message);
    }
  }
}