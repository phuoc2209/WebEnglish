import * as TestModel from '../models/test.model';

/**
 * Controller quản lý bài kiểm tra, câu hỏi và phản hồi người dùng
 */
export class TestController {
  /**
   * Lấy danh sách bài kiểm tra với phân trang
   * @param {{page?: number, pageSize?: number, isPublic?: boolean}} params
   * @returns {Promise<TestResponse>}
   */
  static async getAllQuizzes(params = {}) {
    if (params.page < 1 || params.pageSize < 1) throw new Error('Page hoặc pageSize không hợp lệ');
    try {
      return await TestModel.getAllQuizzes(params);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách bài kiểm tra';
      throw new Error(message);
    }
  }

  /**
   * Lấy bài kiểm tra theo ID
   * @param {number} quizId
   * @returns {Promise<SingleTestResponse>}
   */
  static async getQuizById(quizId) {
    if (!quizId || isNaN(quizId)) throw new Error('ID bài kiểm tra không hợp lệ');
    try {
      return await TestModel.getQuizById(quizId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy bài kiểm tra';
      throw new Error(message);
    }
  }

  /**
   * Tạo bài kiểm tra mới
   * @param {{title: string, description?: string, is_public?: boolean, user_id: number}} quizData
   * @returns {Promise<SingleTestResponse>}
   */
  static async createQuiz(quizData) {
    if (!quizData.title || !quizData.user_id) throw new Error('Thiếu trường bắt buộc: title, user_id');
    if (quizData.title.length > 255) throw new Error('Tiêu đề quá dài');
    if (quizData.description && quizData.description.length > 1000) throw new Error('Mô tả quá dài');
    try {
      return await TestModel.createQuiz(quizData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tạo bài kiểm tra';
      throw new Error(message);
    }
  }

  /**
   * Xóa bài kiểm tra
   * @param {number} quizId
   * @returns {Promise<SingleTestResponse>}
   */
  static async deleteQuiz(quizId) {
    if (!quizId || isNaN(quizId)) throw new Error('ID bài kiểm tra không hợp lệ');
    try {
      return await TestModel.deleteQuiz(quizId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi xóa bài kiểm tra';
      throw new Error(message);
    }
  }

  /**
   * Lấy lịch sử làm bài kiểm tra của người dùng
   * @param {number} userId
   * @param {number} [quizId]
   * @returns {Promise<TestResponse>}
   */
  static async getUserTestAttempts(userId, quizId = null) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    if (quizId && isNaN(quizId)) throw new Error('ID bài kiểm tra không hợp lệ');
    try {
      return await TestModel.getUserTestAttempts(userId, quizId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy lịch sử làm bài kiểm tra';
      throw new Error(message);
    }
  }

  /**
   * Nộp câu trả lời cho câu hỏi
   * @param {{attemptId: number, questionId: number, userAnswer: string}} answerData
   * @returns {Promise<SingleTestResponse>}
   */
  static async submitAnswer(answerData) {
    if (!answerData.attemptId || !answerData.questionId || !answerData.userAnswer) {
      throw new Error('Thiếu các trường bắt buộc');
    }
    if (typeof answerData.userAnswer !== 'string' || answerData.userAnswer.length > 255) {
      throw new Error('Câu trả lời không hợp lệ');
    }
    try {
      return await TestModel.submitAnswer(answerData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi nộp câu trả lời';
      throw new Error(message);
    }
  }

  /**
   * Lấy danh sách câu trả lời đã nộp
   * @param {number} attemptId
   * @returns {Promise<TestResponse>}
   */
  static async getAnswerSubmissions(attemptId) {
    if (!attemptId || isNaN(attemptId)) throw new Error('ID lượt làm bài không hợp lệ');
    try {
      return await TestModel.getAnswerSubmissions(attemptId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách câu trả lời';
      throw new Error(message);
    }
  }

  /**
   * Tính điểm bài kiểm tra
   * @param {number} attemptId
   * @returns {Promise<SingleTestResponse>}
   */
  static async calculateTestScore(attemptId) {
    if (!attemptId || isNaN(attemptId)) throw new Error('ID lượt làm bài không hợp lệ');
    try {
      return await TestModel.calculateTestScore(attemptId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tính điểm bài kiểm tra';
      throw new Error(message);
    }
  }

  /**
   * Lấy thống kê bài kiểm tra
   * @param {number} quizId
   * @returns {Promise<SingleTestResponse>}
   */
  static async getQuizStatistics(quizId) {
    if (!quizId || isNaN(quizId)) throw new Error('ID bài kiểm tra không hợp lệ');
    try {
      return await TestModel.getQuizStatistics(quizId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy thống kê bài kiểm tra';
      throw new Error(message);
    }
  }

  /**
   * Tạo bài kiểm tra ngẫu nhiên
   * @param {{easy?: number, medium?: number, hard?: number}} params
   * @returns {Promise<TestResponse>}
   */
  static async generateRandomQuiz(params = {}) {
    if (params.easy < 0 || params.medium < 0 || params.hard < 0) throw new Error('Số lượng câu hỏi không hợp lệ');
    try {
      return await TestModel.generateRandomQuiz(params);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tạo bài kiểm tra ngẫu nhiên';
      throw new Error(message);
    }
  }

  /**
   * Nhập bài kiểm tra từ file Excel
   * @param {{file: File, title: string, description?: string, is_public?: boolean, user_id: number}} data
   * @returns {Promise<SingleTestResponse>}
   */
  static async importQuizFromExcel(data) {
    if (!data.file) throw new Error('Không có file được tải lên');
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.is_public !== undefined) formData.append('is_public', data.is_public);
      formData.append('user_id', data.user_id);
      return await TestModel.importQuizFromExcel(formData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi nhập bài kiểm tra từ Excel';
      throw new Error(message);
    }
  }

  /**
   * Xác thực file Excel
   * @param {File} file
   * @returns {Promise<SingleTestResponse>}
   */
  static async validateQuizExcel(file) {
    if (!file) throw new Error('Không có file được tải lên');
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await TestModel.validateQuizExcel(formData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi xác thực file Excel';
      throw new Error(message);
    }
  }
}