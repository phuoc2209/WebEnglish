import api from '../services/api';

/**
 * @typedef {Object} AnswerKey
 * @property {number} answer_id
 * @property {number} question_id
 * @property {string} option_text
 * @property {boolean} is_correct
 * @property {string} explanation
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {number} question_id
 * @property {number} quiz_id
 * @property {string} question
 * @property {string} difficulty
 * @property {AnswerKey[]} answerkeys
 */

/**
 * @typedef {Object} Quiz
 * @property {number} quiz_id
 * @property {string} title
 * @property {string} description
 * @property {number} user_id
 * @property {boolean} is_public
 * @property {QuizQuestion[]} quizquestions
 */

/**
 * @typedef {Object} TestAttempt
 * @property {number} attempt_id
 * @property {number} quiz_id
 * @property {number} user_id
 * @property {number} score
 * @property {string} started_at
 * @property {string} completed_at
 * @property {Quiz} quiz
 * @property {User} user
 */

/**
 * @typedef {Object} AnswerSubmission
 * @property {number} submission_id
 * @property {number} attempt_id
 * @property {number} question_id
 * @property {string} user_answer
 * @property {boolean} is_correct
 * @property {QuizQuestion} quizquestion
 */

/**
 * @typedef {Object} QuizStatistics
 * @property {number} total_attempts
 * @property {number} unique_users
 * @property {number|null} average_score
 */

/**
 * @typedef {Object} TestResponse
 * @property {"success"|"error"} status
 * @property {Quiz[]|TestAttempt[]|AnswerSubmission[]|QuizStatistics|Object} data
 * @property {string} message
 */

/**
 * @typedef {Object} SingleTestResponse
 * @property {"success"|"error"} status
 * @property {Quiz|TestAttempt|AnswerSubmission|Object} data
 * @property {string} message
 */

/**
 * Lấy danh sách bài kiểm tra với phân trang
 * @param {{page?: number, pageSize?: number, isPublic?: boolean}} params
 * @returns {Promise<TestResponse>}
 */
export async function getAllQuizzes(params = {}) {
  try {
    const response = await api.get('/tests/quizzes', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Lấy bài kiểm tra theo ID
 * @param {number} quizId
 * @returns {Promise<SingleTestResponse>}
 */
export async function getQuizById(quizId) {
  try {
    const response = await api.get(`/tests/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Tạo bài kiểm tra mới
 * @param {{title: string, description?: string, is_public?: boolean, user_id: number}} quizData
 * @returns {Promise<SingleTestResponse>}
 */
export async function createQuiz(quizData) {
  try {
    const response = await api.post('/tests/quizzes', quizData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Xóa bài kiểm tra
 * @param {number} quizId
 * @returns {Promise<SingleTestResponse>}
 */
export async function deleteQuiz(quizId) {
  try {
    const response = await api.delete(`/tests/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Lấy lịch sử làm bài kiểm tra của người dùng
 * @param {number} userId
 * @param {number} [quizId]
 * @returns {Promise<TestResponse>}
 */
export async function getUserTestAttempts(userId, quizId = null) {
  try {
    const params = quizId ? { quizId } : {};
    const response = await api.get(`/tests/attempts/user/${userId}`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Tạo lượt làm bài kiểm tra mới
 * @param {number} userId
 * @param {number} quizId
 * @returns {Promise<SingleTestResponse>}
 */
export async function createTestAttempt(userId, quizId) {
  try {
    const response = await api.post('/tests/attempts', { userId, quizId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Nộp câu trả lời cho câu hỏi
 * @param {{attemptId: number, questionId: number, userAnswer: string}} answerData
 * @returns {Promise<SingleTestResponse>}
 */
export async function submitAnswer(answerData) {
  try {
    const response = await api.post('/tests/answers', answerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Lấy danh sách câu trả lời đã nộp
 * @param {number} attemptId
 * @returns {Promise<TestResponse>}
 */
export async function getAnswerSubmissions(attemptId) {
  try {
    const response = await api.get(`/tests/answers/${attemptId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Tính điểm bài kiểm tra
 * @param {number} attemptId
 * @returns {Promise<SingleTestResponse>}
 */
export async function calculateTestScore(attemptId) {
  try {
    const response = await api.get(`/tests/score/${attemptId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Lấy thống kê bài kiểm tra
 * @param {number} quizId
 * @returns {Promise<SingleTestResponse>}
 */
export async function getQuizStatistics(quizId) {
  try {
    const response = await api.get(`/tests/statistics/${quizId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Tạo bài kiểm tra ngẫu nhiên
 * @param {{easy?: number, medium?: number, hard?: number}} params
 * @returns {Promise<TestResponse>}
 */
export async function generateRandomQuiz(params = {}) {
  try {
    const response = await api.post('/tests/quizzes/random', params);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Nhập bài kiểm tra từ file Excel
 * @param {FormData} formData
 * @returns {Promise<SingleTestResponse>}
 */
export async function importQuizFromExcel(formData) {
  try {
    const response = await api.post('/tests/quizzes/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Xác thực file Excel
 * @param {FormData} formData
 * @returns {Promise<SingleTestResponse>}
 */
export async function validateQuizExcel(formData) {
  try {
    const response = await api.post('/tests/quizzes/validate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}