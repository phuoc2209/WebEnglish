import api from '../services/api';

/**
 * @typedef {Object} Lesson
 * @property {number} lesson_id
 * @property {string} title
 * @property {string} content
 * @property {string} meaning
 * @property {string} usage
 * @property {string} examples
 * @property {'grammar'|'vocab'} lesson_type
 * @property {Exercise[]} exercises
 */

/**
 * @typedef {Object} Exercise
 * @property {number} exercise_id
 * @property {string} question
 * @property {string} correct_answer
 * @property {string} options
 * @property {'grammar'|'vocab'|'skill'} lesson_type
 * @property {number} lesson_id
 * @property {number} skill_id
 */

/**
 * @typedef {Object} LessonsResponse
 * @property {"success"|"error"} status
 * @property {Lesson[]|Exercise[]} data
 * @property {string} message
 * @property {{limit: number, offset: number, total: number}} pagination
 */

/**
 * @typedef {Object} LessonResponse
 * @property {"success"|"error"} status
 * @property {Lesson|Exercise} data
 * @property {string} message
 */

/**
 * Lấy tất cả bài học theo loại
 * @param {'grammar'|'vocab'} lesson_type
 * @param {number} limit
 * @param {number} offset
 * @param {number} lesson_id - Optional, để lấy bài học cụ thể
 * @returns {Promise<LessonsResponse>}
 */
export async function getAllLessons(lesson_type, limit, offset, lesson_id = null) {
  try {
    let url = '';
    if (lesson_type === 'grammar') {
      url = '/lessons/grammar';
    } else if (lesson_type === 'vocab' || lesson_type === 'vocabulary') {
      url = '/lessons/vocabulary';
    } else {
      url = '/lessons';
    }

    const params = { limit, offset };
    if (lesson_id) {
      params.lesson_id = lesson_id;
    }
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy bài học theo ID
 * @param {number} lessonId
 * @param {'grammar'|'vocab'} lessonType - Loại bài học
 * @returns {Promise<LessonResponse>}
 */
export async function getLessonById(lessonId, lessonType = 'grammar') {
  try {
    let url = '';
    if (lessonType === 'grammar') {
      url = `/lessons/grammar/${lessonId}`;
    } else if (lessonType === 'vocab') {
      url = `/lessons/vocabulary/${lessonId}`;
    } else {
      url = `/lessons/${lessonId}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Tạo bài học mới
 * @param {{lesson_type: string, title: string, content: string, meaning?: string, usage?: string, examples?: string}} lessonData
 * @returns {Promise<LessonResponse>}
 */
export async function createLesson(lessonData) {
  try {
    const response = await api.post('/lessons', lessonData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Cập nhật bài học
 * @param {number} lessonId
 * @param {{title?: string, content?: string, meaning?: string, usage?: string, examples?: string}} lessonData
 * @returns {Promise<LessonResponse>}
 */
export async function updateLesson(lessonId, lessonData) {
  try {
    const response = await api.put(`/lessons/${lessonId}`, lessonData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Xóa bài học
 * @param {number} lessonId
 * @returns {Promise<LessonResponse>}
 */
export async function deleteLesson(lessonId) {
  try {
    const response = await api.delete(`/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy tất cả bài tập
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<LessonsResponse>}
 */
export async function getAllExercises(limit, offset) {
  try {
    const response = await api.get('/lessons/exercises', { params: { limit, offset } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy bài tập theo ID
 * @param {number} exerciseId
 * @returns {Promise<LessonResponse>}
 */
export async function getExerciseById(exerciseId) {
  try {
    const response = await api.get(`/lessons/exercises/${exerciseId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy bài tập theo loại và ID bài học
 * @param {string} lessonType
 * @param {number} lessonId
 * @returns {Promise<LessonsResponse>}
 */
export async function getExercisesByType(lessonType, lessonId) {
  try {
    const response = await api.get(`/lessons/exercises/type/${lessonType}/${lessonId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Tạo bài tập mới
 * @param {{question: string, correct_answer: string, options?: string, lesson_type: string, lesson_id?: number, skill_id?: number}} exerciseData
 * @returns {Promise<LessonResponse>}
 */
export async function createExercise(exerciseData) {
  try {
    const response = await api.post('/lessons/exercises', exerciseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Cập nhật bài tập
 * @param {number} exerciseId
 * @param {{question?: string, correct_answer?: string, options?: string, lesson_type?: string, lesson_id?: number, skill_id?: number}} exerciseData
 * @returns {Promise<LessonResponse>}
 */
export async function updateExercise(exerciseId, exerciseData) {
  try {
    const response = await api.put(`/lessons/exercises/${exerciseId}`, exerciseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Xóa bài tập
 * @param {number} exerciseId
 * @returns {Promise<LessonResponse>}
 */
export async function deleteExercise(exerciseId) {
  try {
    const response = await api.delete(`/lessons/exercises/${exerciseId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Cập nhật tiến độ học tập
 * @param {{lesson_type: string, lesson_id?: number, skill_id?: number, status?: string, progress_percent?: number}} progressData
 * @returns {Promise<{status: string, message: string}>}
 */
export async function updateProgress(progressData) {
  try {
    const response = await api.post('/lessons/progress', progressData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lưu kết quả làm bài tập (exercise) cho các bài học ngữ pháp, từ vựng, nghe, đọc
 * @param {number} exercise_id
 * @param {string} user_answer
 * @returns {Promise<Object>} - Kết quả lưu submission
 */
export async function submitExerciseSubmission(exercise_id, user_answer) {
  try {
    const response = await api.post('/lessons/exercisesubmission', { exercise_id, user_answer });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi lưu kết quả bài tập');
  }
}

/**
 * Lấy thông tin tiến độ và câu trả lời đã nộp của người dùng cho một bài học
 * @param {number} lessonId
 * @param {string} lessonType
 * @returns {Promise<LessonResponse>}
 */
export async function getLessonProgressAndAnswers(lessonId, lessonType) {
  try {
    const response = await api.get(`/lessons/progress/${lessonId}/${lessonType}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}
