import * as CommunityModel from '../models/community.model';

/**
 * Controller quản lý logic cộng đồng
 */
export class CommunityController {
  /**
   * Lấy tất cả bài viết
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<PostsResponse>}
   */
  static async getAllPosts(page = 1, limit = 10) {
    if (page < 1 || limit < 1) throw new Error('Page hoặc limit không hợp lệ');
    try {
      return await CommunityModel.getAllPosts(page, limit);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách bài viết';
      throw new Error(message);
    }
  }

  /**
   * Lấy bài viết theo ID
   * @param {number} postId
   * @returns {Promise<PostResponse>}
   */
  static async getPostById(postId) {
    if (!postId || isNaN(postId)) throw new Error('ID bài viết không hợp lệ');
    try {
      return await CommunityModel.getPostById(postId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy bài viết';
      throw new Error(message);
    }
  }

  /**
   * Tạo bài viết
   * @param {number} userId
   * @param {string} content
   * @returns {Promise<PostResponse>}
   */
  static async createPost(userId, content) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    if (!content || content.trim() === '') throw new Error('Nội dung bài viết không được để trống');
    if (content.length > 10000) throw new Error('Nội dung bài viết quá dài (tối đa 10,000 ký tự)');
    try {
      return await CommunityModel.createPost({ content });
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tạo bài viết';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật bài viết
   * @param {number} postId
   * @param {string} content
   * @returns {Promise<PostResponse>}
   */
  static async updatePost(postId, content) {
    if (!postId || isNaN(postId)) throw new Error('ID bài viết không hợp lệ');
    if (!content || content.trim() === '') throw new Error('Nội dung bài viết không được để trống');
    if (content.length > 10000) throw new Error('Nội dung bài viết quá dài (tối đa 10,000 ký tự)');
    try {
      return await CommunityModel.updatePost(postId, { content });
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật bài viết';
      throw new Error(message);
    }
  }

  /**
   * Xóa bài viết
   * @param {number} postId
   * @returns {Promise<PostResponse>}
   */
  static async deletePost(postId) {
    if (!postId || isNaN(postId)) throw new Error('ID bài viết không hợp lệ');
    try {
      return await CommunityModel.deletePost(postId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi xóa bài viết';
      throw new Error(message);
    }
  }

  /**
   * Tạo bình luận
   * @param {number} postId
   * @param {number} userId
   * @param {string} content
   * @returns {Promise<CommentResponse>}
   */
  static async createComment(postId, userId, content) {
    if (!postId || isNaN(postId)) throw new Error('ID bài viết không hợp lệ');
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    if (!content || content.trim() === '') throw new Error('Nội dung bình luận không được để trống');
    if (content.length > 5000) throw new Error('Nội dung bình luận quá dài (tối đa 5,000 ký tự)');
    try {
      return await CommunityModel.createComment(postId, { content });
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tạo bình luận';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật bình luận
   * @param {number} commentId
   * @param {string} content
   * @returns {Promise<CommentResponse>}
   */
  static async updateComment(commentId, content) {
    if (!commentId || isNaN(commentId)) throw new Error('ID bình luận không hợp lệ');
    if (!content || content.trim() === '') throw new Error('Nội dung bình luận không được để trống');
    if (content.length > 5000) throw new Error('Nội dung bình luận quá dài (tối đa 5,000 ký tự)');
    try {
      return await CommunityModel.updateComment(commentId, { content });
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật bình luận';
      throw new Error(message);
    }
  }

  /**
   * Xóa bình luận
   * @param {number} commentId
   * @returns {Promise<CommentResponse>}
   */
  static async deleteComment(commentId) {
    if (!commentId || isNaN(commentId)) throw new Error('ID bình luận không hợp lệ');
    try {
      return await CommunityModel.deleteComment(commentId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi xóa bình luận';
      throw new Error(message);
    }
  }

  /**
 * Thích hoặc bỏ thích bài viết hoặc bình luận
 * @param {{postId?: number, commentId?: number}} target
 * @param {number} userId
 * @returns {Promise<LikeResponse>}
 */
static async toggleLike(target, userId) {
  if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");

  if (target.postId) {
    if (isNaN(target.postId)) throw new Error("ID bài viết không hợp lệ");
    try {
      return await CommunityModel.togglePostLike(target.postId, userId);
    } catch (error) {
      throw new Error(error.response?.data?.message || "Lỗi khi thích bài viết");
    }
  }

  if (target.commentId) {
    if (isNaN(target.commentId)) throw new Error("ID bình luận không hợp lệ");
    try {
      return await CommunityModel.toggleCommentLike(target.commentId, userId);
    } catch (error) {
      throw new Error(error.response?.data?.message || "Lỗi khi thích bình luận");
    }
  }

  throw new Error("Không xác định đối tượng để thích (postId hoặc commentId)");
}


  /**
   * Báo cáo bài viết
   * @param {number} postId
   * @param {number} userId
   * @param {string} reason
   * @returns {Promise<ReportResponse>}
   */
  static async reportPost(postId, userId, reason) {
    if (!postId || isNaN(postId)) throw new Error('ID bài viết không hợp lệ');
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    if (!reason || reason.trim() === '') throw new Error('Lý do báo cáo không được để trống');
    if (reason.length > 1000) throw new Error('Lý do báo cáo quá dài (tối đa 1,000 ký tự)');
    try {
      return await CommunityModel.reportPost(postId, { reason });
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi báo cáo bài viết';
      throw new Error(message);
    }
  }

  /**
   * Lấy tất cả báo cáo (admin)
   * @returns {Promise<ReportsResponse>}
   */
  static async getAllReports() {
    try {
      return await CommunityModel.getAllReports();
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách báo cáo';
      throw new Error(message);
    }
  }

  /**
   * Xóa bài viết (admin)
   * @param {number} postId
   * @returns {Promise<PostResponse>}
   */
  static async adminDeletePost(postId) {
    if (!postId || isNaN(postId)) throw new Error('ID bài viết không hợp lệ');
    try {
      return await CommunityModel.adminDeletePost(postId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi xóa bài viết';
      throw new Error(message);
    }
  }
}