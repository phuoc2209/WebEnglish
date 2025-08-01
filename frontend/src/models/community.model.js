import api from '../services/api';

/**
 * @typedef {Object} User
 * @property {number} user_id
 * @property {string} username
 */

/**
 * @typedef {Object} Comment
 * @property {number} comment_id
 * @property {number} post_id
 * @property {number} user_id
 * @property {string} content
 * @property {string} created_at
 * @property {User} user
 */

/**
 * @typedef {Object} Reaction
 * @property {number} reaction_id
 * @property {number} user_id
 * @property {string} type
 */

/**
 * @typedef {Object} Post
 * @property {number} post_id
 * @property {number} user_id
 * @property {string} content
 * @property {string} created_at
 * @property {User} user
 * @property {Comment[]} comments
 * @property {Reaction[]} reactions
 * @property {boolean} isLiked
 * @property {number} likeCount
 */

/**
 * @typedef {Object} Report
 * @property {number} report_id
 * @property {number} post_id
 * @property {number} user_id
 * @property {string} reason
 * @property {string} reported_at
 * @property {Post} post
 * @property {User} user
 */

/**
 * @typedef {Object} PostsResponse
 * @property {"success"|"error"} status
 * @property {Post[]} data
 * @property {string} message
 * @property {Object} pagination
 * @property {number} pagination.page
 * @property {number} pagination.limit
 * @property {number} pagination.total
 * @property {number} pagination.totalPages
 */

/**
 * @typedef {Object} PostResponse
 * @property {"success"|"error"} status
 * @property {Post} data
 * @property {string} message
 */

/**
 * @typedef {Object} CommentResponse
 * @property {"success"|"error"} status
 * @property {Comment} data
 * @property {string} message
 */

/**
 * @typedef {Object} LikeResponse
 * @property {"success"|"error"} status
 * @property {{isLiked: boolean, likeCount: number}} data
 * @property {string} message
 */

/**
 * @typedef {Object} ReportResponse
 * @property {"success"|"error"} status
 * @property {Report} data
 * @property {string} message
 */

/**
 * @typedef {Object} ReportsResponse
 * @property {"success"|"error"} status
 * @property {Report[]} data
 * @property {string} message
 */

/**
 * Lấy tất cả bài viết với phân trang
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<PostsResponse>}
 */
export async function getAllPosts(page = 1, limit = 10) {
  try {
    const response = await api.get('/community/posts', { params: { page, limit } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Lấy bài viết theo ID
 * @param {number} postId
 * @returns {Promise<PostResponse>}
 */
export async function getPostById(postId) {
  try {
    const response = await api.get(`/community/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Tạo bài viết mới
 * @param {{content: string}} data
 * @returns {Promise<PostResponse>}
 */
export async function createPost(data) {
  try {
    const response = await api.post('/community/posts', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Cập nhật bài viết
 * @param {number} postId
 * @param {{content: string}} data
 * @returns {Promise<PostResponse>}
 */
export async function updatePost(postId, data) {
  try {
    const response = await api.put(`/community/posts/${postId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Xóa bài viết
 * @param {number} postId
 * @returns {Promise<PostResponse>}
 */
export async function deletePost(postId) {
  try {
    const response = await api.delete(`/community/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Tạo bình luận mới
 * @param {number} postId
 * @param {{content: string}} data
 * @returns {Promise<CommentResponse>}
 */
export async function createComment(postId, data) {
  try {
    const response = await api.post(`/community/posts/${postId}/comments`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Cập nhật bình luận
 * @param {number} commentId
 * @param {{content: string}} data
 * @returns {Promise<CommentResponse>}
 */
export async function updateComment(commentId, data) {
  try {
    const response = await api.put(`/community/comments/${commentId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Xóa bình luận
 * @param {number} commentId
 * @returns {Promise<CommentResponse>}
 */
export async function deleteComment(commentId) {
  try {
    const response = await api.delete(`/community/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Thích hoặc bỏ thích bài viết
 * @param {number} postId
 * @returns {Promise<LikeResponse>}
 */
export async function togglePostLike(postId, userId) {
  try {
    const response = await api.post(`/community/posts/${postId}/like`, { userId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

export async function toggleCommentLike(commentId, userId) {
  return await api.post(`/community/comments/${commentId}/like`, { userId });
}

/**
 * Báo cáo bài viết
 * @param {number} postId
 * @param {{reason: string}} data
 * @returns {Promise<ReportResponse>}
 */
export async function reportPost(postId, data) {
  try {
    const response = await api.post(`/community/posts/${postId}/reports`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Lấy tất cả báo cáo (admin)
 * @returns {Promise<ReportsResponse>}
 */
export async function getAllReports() {
  try {
    const response = await api.get('/community/reports');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}

/**
 * Xóa bài viết (admin)
 * @param {number} postId
 * @returns {Promise<PostResponse>}
 */
export async function adminDeletePost(postId) {
  try {
    const response = await api.delete(`/community/admin/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }

}