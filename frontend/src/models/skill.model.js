import api from '../services/api';

/**
 * @typedef {Object} Topic
 * @property {number} topic_id
 * @property {string} title
 */

/**
 * @typedef {Object} Exercise
 * @property {number} exercise_id
 * @property {string} question
 * @property {string} correct_answer
 */

/**
 * @typedef {Object} SkillLesson
 * @property {number} skill_id
 * @property {string} title
 * @property {string} description
 * @property {string} skill_type
 * @property {string} reading_content
 * @property {string} writing_prompt
 * @property {string} suggested_vocabulary
 * @property {string} examples
 * @property {Exercise[]} exercises
 */

/**
 * @typedef {Object} UserResponse
 * @property {number} id
 * @property {number} user_id
 * @property {number} listening_id
 * @property {number} skill_id
 * @property {string} response
 * @property {string} content
 * @property {string} submitted_at
 */

/**
 * @typedef {Object} SkillSubmission
 * @property {number} submission_id
 * @property {number} user_id
 * @property {number} skill_id
 * @property {string} skill_type
 * @property {string} question
 * @property {string} options
 * @property {string} user_answer
 * @property {boolean} is_correct
 * @property {string} audio_file
 * @property {string} content
 * @property {string} submitted_at
 */

/**
 * @typedef {Object} SkillResponse
 * @property {"success"|"error"} status
 * @property {SkillLesson[]|SkillSubmission[]} data
 * @property {string} message
 */

/**
 * @typedef {Object} SingleSkillResponse
 * @property {"success"|"error"} status
 * @property {SkillLesson|SkillSubmission} data
 * @property {string} message
 */

/**
 * Lấy bài học kỹ năng theo ID
 * @param {number} skillId
 * @returns {Promise<SingleSkillResponse>}
 */
export async function getSkillLessonById(skillId) {
  try {
    const response = await api.get(`/skills/${skillId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy danh sách bài học kỹ năng theo loại
 * @param {string} skillType
 * @returns {Promise<SkillResponse>}
 */
export async function getSkillLessonsByType(skillType) {
  try {
    const response = await api.get(`/skills/type/${skillType}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy danh sách bài học kỹ năng với exercises theo loại
 * @param {string} skillType
 * @returns {Promise<SkillResponse>}
 */
export async function getSkillLessonsByTypeWithExercises(skillType) {
  try {
    const response = await api.get(`/skills/type/${skillType}/exercises`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Tạo bài học kỹ năng mới
 * @param {{title: string, description: string, skill_type: string, reading_content?: string, writing_prompt?: string, suggested_vocabulary?: string, examples?: string}} skillData
 * @returns {Promise<SingleSkillResponse>}
 */
export async function createSkillLesson(skillData) {
  try {
    const response = await api.post('/skills', skillData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Cập nhật bài học kỹ năng
 * @param {number} id
 * @param {{title?: string, description?: string, skill_type?: string, reading_content?: string, writing_prompt?: string, suggested_vocabulary?: string, examples?: string}} skillData
 * @returns {Promise<SingleSkillResponse>}
 */
export async function updateSkillLesson(id, skillData) {
  try {
    const response = await api.put(`/skills/${id}`, skillData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Xóa bài học kỹ năng
 * @param {number} id
 * @returns {Promise<SingleSkillResponse>}
 */
export async function deleteSkillLesson(id) {
  try {
    const response = await api.delete(`/skills/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Nộp bài tập kỹ năng
 * @param {{skill_id: number, skill_type: string, question?: string, options?: string, user_answer?: string, is_correct?: boolean, audio_file?: string, content?: string, score?: number}} submissionData
 * @returns {Promise<SingleSkillResponse>}
 */
export async function submitSkillSubmission(submissionData) {
  try {
    const response = await api.post('/skills/submissions', submissionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Nộp bài tập kỹ năng với FormData (cho audio files)
 * @param {FormData} formData
 * @returns {Promise<SingleSkillResponse>}
 */
export async function submitSkillSubmissionWithFormData(formData) {
  try {
    const response = await api.post('/skills/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy bài nộp của người dùng theo kỹ năng
 * @param {number} skillId
 * @param {string} skillType
 * @returns {Promise<SkillResponse>}
 */
export async function getUserSubmissionsBySkill(skillId, skillType) {
  try {
    const response = await api.get(`/skills/${skillId}/submissions`, { params: { skill_type: skillType } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Cập nhật video cho bài học listening
 * @param {number} skillId
 * @param {{video_url: string, video_public_id: string}} videoData
 * @returns {Promise<SingleSkillResponse>}
 */
export async function updateSkillVideo(skillId, videoData) {
  try {
    const response = await api.put(`/skills/${skillId}/video`, videoData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy điểm trung bình theo user ID
 * @param {number} userId
 * @returns {Promise<SkillResponse>}
 */
export async function getAverageScoresByUserId(userId) {
  try {
    const response = await api.get(`/skills/average-scores/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy tiến độ và câu trả lời của bài học kỹ năng
 * @param {number} lessonId
 * @param {string} lessonType
 * @returns {Promise<Object>}
 */
export async function getLessonProgressAndAnswers(lessonId, lessonType) {
  try {
    const response = await api.get(`/lessons/progress/${lessonId}/${lessonType}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}