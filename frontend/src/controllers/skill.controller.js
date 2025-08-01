import * as SkillModel from '../models/skill.model';

/**
 * Controller quản lý bài học kỹ năng và bài nộp người dùng
 */
export class SkillController {
  /**
   * Lấy danh sách bài học kỹ năng theo loại
   * @param {string} skillType
   * @returns {Promise<SkillResponse>}
   */
  static async getByType(skillType) {
    if (!['listening', 'speaking', 'reading', 'writing'].includes(skillType)) {
      throw new Error('Loại kỹ năng không hợp lệ');
    }
    try {
      return await SkillModel.getSkillLessonsByType(skillType);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách bài học kỹ năng';
      throw new Error(message);
    }
  }

  /**
   * Lấy danh sách bài học kỹ năng với exercises theo loại
   * @param {string} skillType
   * @returns {Promise<SkillResponse>}
   */
  static async getByTypeWithExercises(skillType) {
    if (!['listening', 'speaking', 'reading', 'writing'].includes(skillType)) {
      throw new Error('Loại kỹ năng không hợp lệ');
    }
    try {
      return await SkillModel.getSkillLessonsByTypeWithExercises(skillType);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách bài học kỹ năng với bài tập';
      throw new Error(message);
    }
  }

  /**
   * Tạo bài học kỹ năng mới
   * @param {{title: string, description: string, skill_type: string, reading_content?: string, writing_prompt?: string, suggested_vocabulary?: string, examples?: string}} skillData
   * @returns {Promise<SingleSkillResponse>}
   */
  static async create(skillData) {
    if (!skillData.title || !skillData.description || !skillData.skill_type) {
      throw new Error('Thiếu các trường bắt buộc: title, description, skill_type');
    }
    if (!['listening', 'speaking', 'reading', 'writing'].includes(skillData.skill_type)) {
      throw new Error('Loại kỹ năng không hợp lệ');
    }
    try {
      return await SkillModel.createSkillLesson(skillData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tạo bài học kỹ năng';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật bài học kỹ năng
   * @param {number} id
   * @param {{title?: string, description?: string, skill_type?: string, reading_content?: string, writing_prompt?: string, suggested_vocabulary?: string, examples?: string}} skillData
   * @returns {Promise<SingleSkillResponse>}
   */
  static async update(id, skillData) {
    if (!id || isNaN(id)) throw new Error('ID bài học không hợp lệ');
    if (skillData.skill_type && !['listening', 'speaking', 'reading', 'writing'].includes(skillData.skill_type)) {
      throw new Error('Loại kỹ năng không hợp lệ');
    }
    try {
      return await SkillModel.updateSkillLesson(id, skillData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật bài học kỹ năng';
      throw new Error(message);
    }
  }

  /**
   * Xóa bài học kỹ năng
   * @param {number} id
   * @returns {Promise<SingleSkillResponse>}
   */
  static async delete(id) {
    if (!id || isNaN(id)) throw new Error('ID bài học không hợp lệ');
    try {
      return await SkillModel.deleteSkillLesson(id);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi xóa bài học kỹ năng';
      throw new Error(message);
    }
  }

  /**
   * Nộp bài tập kỹ năng
   * @param {{skill_id: number, skill_type: string, question?: string, options?: string, user_answer?: string, is_correct?: boolean, audio_file?: string, content?: string}} submissionData
   * @returns {Promise<SingleSkillResponse>}
   */
  static async submitSubmission(submissionData) {
    if (!submissionData.skill_id || !submissionData.skill_type) {
      throw new Error('Thiếu các trường bắt buộc: skill_id, skill_type');
    }
    if (!['listening', 'speaking', 'reading', 'writing'].includes(submissionData.skill_type)) {
      throw new Error('Loại kỹ năng không hợp lệ');
    }
    try {
      return await SkillModel.submitSkillSubmission(submissionData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi nộp bài tập kỹ năng';
      throw new Error(message);
    }
  }

  /**
   * Lấy bài nộp của người dùng theo kỹ năng
   * @param {number} skillId
   * @param {string} skillType
   * @returns {Promise<SkillResponse>}
   */
  static async getUserSubmissions(skillId, skillType) {
    if (!skillId || isNaN(skillId)) throw new Error('ID bài học không hợp lệ');
    if (!['listening', 'speaking', 'reading', 'writing'].includes(skillType)) {
      throw new Error('Loại kỹ năng không hợp lệ');
    }
    try {
      return await SkillModel.getUserSubmissionsBySkill(skillId, skillType);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy bài nộp của người dùng';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật video cho bài học listening
   * @param {number} skillId
   * @param {{video_url: string, video_public_id: string}} videoData
   * @returns {Promise<SingleSkillResponse>}
   */
  static async updateVideo(skillId, videoData) {
    if (!skillId || isNaN(skillId)) throw new Error('ID bài học không hợp lệ');
    if (!videoData.video_url || !videoData.video_public_id) {
      throw new Error('Thiếu các trường bắt buộc: video_url, video_public_id');
    }
    try {
      return await SkillModel.updateSkillVideo(skillId, videoData);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật video';
      throw new Error(message);
    }
  }
}