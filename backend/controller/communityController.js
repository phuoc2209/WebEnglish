const sequelize = require("../config/database");
const initModels = require("../models/init-models");
const models = initModels(sequelize);

/**
 * Controller quản lý các tính năng cộng đồng (bài viết, bình luận, phản ứng, báo cáo) cho website học tiếng Anh
 */
class CommunityController {
  /**
   * Kiểm tra quyền người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {string} requiredRole - Vai trò yêu cầu (ví dụ: 'admin')
   * @throws {Error} - Nếu người dùng không có quyền
   */
  static checkPermission(req, requiredRole) {
    if (!req.user || req.user.role !== requiredRole) {
      throw new Error(`Quyền bị từ chối. Chỉ ${requiredRole} mới được thực hiện hành động này.`);
    }
  }

  /**
   * Kiểm tra quyền sở hữu tài nguyên
   * @param {Object} req - Yêu cầu HTTP
   * @param {Object} model - Model Sequelize
   * @param {string} idField - Trường ID (ví dụ: 'post_id')
   * @param {number} idValue - Giá trị ID
   * @param {string} [ownerField='user_id'] - Trường xác định chủ sở hữu
   * @returns {Promise<Object>} - Tài nguyên được tìm thấy
   * @throws {Error} - Nếu tài nguyên không tồn tại hoặc người dùng không có quyền
   */
  static async checkOwnership(req, model, idField, idValue, ownerField = "user_id") {
    if (!idValue || isNaN(idValue)) throw new Error(`ID ${idField} không hợp lệ`);
    const item = await model.findByPk(idValue);
    if (!item) throw new Error("Không tìm thấy tài nguyên.");
    if (item[ownerField] !== req.user.user_id && req.user.role !== "admin") {
      throw new Error("Bạn không có quyền thực hiện hành động này.");
    }
    return item;
  }

  /**
   * Lấy tất cả bài viết cộng đồng với phân trang
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} [page=1] - Số trang
   * @param {number} [limit=10] - Số bản ghi mỗi trang
   * @returns {Promise<Object>} - Danh sách bài viết, tổng số và phân trang
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getAllPosts(req, page = 1, limit = 10) {
    try {
      if (page < 1 || limit < 1) throw new Error("Page hoặc limit không hợp lệ");
      const offset = (page - 1) * limit;

      const posts = await models.communitypost.findAndCountAll({
        limit,
        offset,
        include: [
          {
            model: models.user,
            as: "user",
            attributes: ["user_id", "username", "full_name", "avatar_url"],
            required: true,
          },
          {
            model: models.comment,
            as: "comments",
            include: [
              {
                model: models.user,
                as: "user",
                attributes: ["user_id", "username", "full_name", "avatar_url"],
              },
            ],
          },
          {
            model: models.reaction,
            as: "reactions",
            attributes: ["reaction_id", "user_id", "type"],
          },
        ],
        distinct: true,
        attributes: ["post_id", "user_id", "content", "created_at"],
        order: [["created_at", "DESC"]],
      });

      const enrichedPosts = posts.rows.map((post) => {
        const postData = post.toJSON();
        const heartReactions = postData.reactions.filter((r) => r.type === "heart");
        postData.hearts = heartReactions.length;

        const userReact = postData.reactions.find(
          (r) => r.user_id === req.user?.user_id && r.type === "heart"
        );
        postData.user_reaction = userReact?.type || null;

        postData.comments_count = postData.comments.length;

        return postData;
      });

      return {
        status: "success",
        data: enrichedPosts,
        pagination: {
          page,
          limit,
          total: posts.count,
          totalPages: Math.ceil(posts.count / limit),
        },
        message: "Lấy danh sách bài viết cộng đồng thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in getAllPosts: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Lấy bài viết theo ID
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} postId - ID bài viết
   * @returns {Promise<Object>} - Bài viết chi tiết
   * @throws {Error} - Nếu bài viết không tồn tại hoặc truy vấn thất bại
   */
  static async getPostById(req, postId) {
    try {
      if (!postId || isNaN(postId)) throw new Error("ID bài viết không hợp lệ");
      const post = await models.communitypost.findByPk(postId, {
        include: [
          {
            model: models.user,
            attributes: ["user_id", "username", "full_name", "avatar_url"],
            as: "user",
          },
          {
            model: models.comment,
            as: "comments",
            include: [
              {
                model: models.user,
                attributes: ["user_id", "username", "full_name", "avatar_url"],
                as: "user",
              }
            ],
          },
          { model: models.reaction, attributes: ["reaction_id", "user_id", "type"], as: "reactions" },
        ],
        attributes: ["post_id", "user_id", "content", "created_at"],
      });
      if (!post) throw new Error("Không tìm thấy bài viết");

      const postData = post.toJSON();
      const heartReactions = postData.reactions.filter((r) => r.type === "heart");
      postData.hearts = heartReactions.length;

      const userReact = postData.reactions.find(
        (r) => r.user_id === req.user?.user_id && r.type === "heart"
      );
      postData.user_reaction = userReact?.type || null;

      return {
        status: "success",
        data: postData,
        message: "Lấy bài viết thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in getPostById: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Tạo bài viết mới
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @param {string} content - Nội dung bài viết
   * @returns {Promise<Object>} - Bài viết vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ
   */
  static async createPost(req, userId, content) {
    try {
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!content || content.trim() === "") throw new Error("Nội dung bài viết không được để trống");
      if (content.length > 10000) throw new Error("Nội dung bài viết quá dài (tối đa 10,000 ký tự)");

      const post = await models.communitypost.create({
        user_id: userId,
        content,
        created_at: new Date(),
      });

      return {
        status: "success",
        data: post,
        message: "Tạo bài viết thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in createPost: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Cập nhật bài viết
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} postId - ID bài viết
   * @param {string} content - Nội dung mới
   * @returns {Promise<Object>} - Kết quả cập nhật
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc không có quyền
   */
  static async updatePost(req, postId, content) {
    try {
      await CommunityController.checkOwnership(req, models.communitypost, "post_id", postId);
      if (!content || content.trim() === "") throw new Error("Nội dung bài viết không được để trống");
      if (content.length > 10000) throw new Error("Nội dung bài viết quá dài (tối đa 10,000 ký tự)");

      const [updated] = await models.communitypost.update(
        { content },
        { where: { post_id: postId } }
      );
      if (!updated) throw new Error("Không thể cập nhật bài viết");

      const updatedPost = await models.communitypost.findByPk(postId);
      return {
        status: "success",
        data: updatedPost,
        message: "Cập nhật bài viết thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in updatePost: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Xóa bài viết
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} postId - ID bài viết
   * @returns {Promise<Object>} - Kết quả xóa
   * @throws {Error} - Nếu không có quyền hoặc truy vấn thất bại
   */
  static async deletePost(req, postId) {
    const transaction = await sequelize.transaction();
    try {
      await CommunityController.checkOwnership(req, models.communitypost, "post_id", postId);
      await models.comment.destroy({ where: { post_id: postId }, transaction });
      await models.reaction.destroy({ where: { post_id: postId }, transaction });
      const deleted = await models.communitypost.destroy({ where: { post_id: postId }, transaction });
      if (!deleted) throw new Error("Không thể xóa bài viết");

      await transaction.commit();
      return {
        status: "success",
        data: null,
        message: "Xóa bài viết thành công",
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`[${new Date().toISOString()}] Error in deletePost: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Tạo bình luận mới
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} postId - ID bài viết
   * @param {number} userId - ID người dùng
   * @param {string} content - Nội dung bình luận
   * @returns {Promise<Object>} - Bình luận vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc bài viết không tồn tại
   */
  static async createComment(req, postId, userId, content) {
    try {
      if (!postId || isNaN(postId)) throw new Error("ID bài viết không hợp lệ");
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!content || content.trim() === "") throw new Error("Nội dung bình luận không được để trống");
      if (content.length > 5000) throw new Error("Nội dung bình luận quá dài (tối đa 5,000 ký tự)");

      const post = await models.communitypost.findByPk(postId);
      if (!post) throw new Error("Không tìm thấy bài viết");

      const comment = await models.comment.create({
        post_id: postId,
        user_id: userId,
        content,
      });

      // Lấy comment với thông tin user
      const commentWithUser = await models.comment.findByPk(comment.comment_id, {
        include: [
          {
            model: models.user,
            as: "user",
            attributes: ["user_id", "username", "full_name", "avatar_url"],
          },
        ],
      });

      return {
        status: "success",
        data: commentWithUser,
        message: "Tạo bình luận thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in createComment: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Cập nhật bình luận
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} commentId - ID bình luận
   * @param {string} content - Nội dung mới
   * @returns {Promise<Object>} - Kết quả cập nhật
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc không có quyền
   */
  static async updateComment(req, commentId, content) {
    try {
      await CommunityController.checkOwnership(req, models.comment, "comment_id", commentId);
      if (!content || content.trim() === "") throw new Error("Nội dung bình luận không được để trống");
      if (content.length > 5000) throw new Error("Nội dung bình luận quá dài (tối đa 5,000 ký tự)");

      const [updated] = await models.comment.update(
        { content },
        { where: { comment_id: commentId } }
      );
      if (!updated) throw new Error("Không thể cập nhật bình luận");

      const updatedComment = await models.comment.findByPk(commentId);
      return {
        status: "success",
        data: updatedComment,
        message: "Cập nhật bình luận thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in updateComment: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Xóa bình luận
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} commentId - ID bình luận
   * @returns {Promise<Object>} - Kết quả xóa
   * @throws {Error} - Nếu không có quyền hoặc truy vấn thất bại
   */
  static async deleteComment(req, commentId) {
    const transaction = await sequelize.transaction();
    try {
      await CommunityController.checkOwnership(req, models.comment, "comment_id", commentId);
      const deleted = await models.comment.destroy({ where: { comment_id: commentId }, transaction });
      if (!deleted) throw new Error("Không thể xóa bình luận");

      await transaction.commit();
      return {
        status: "success",
        data: null,
        message: "Xóa bình luận thành công",
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`[${new Date().toISOString()}] Error in deleteComment: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Thích hoặc bỏ thích bài viết
   * @param {Object} req - Yêu cầu HTTP
   * @param {Object} params - Tham số
   * @param {number} params.postId - ID bài viết
   * @param {number} userId - ID người dùng
   * @returns {Promise<Object>} - Kết quả thao tác thích
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async toggleLike(req, { postId }, userId) {
    const transaction = await sequelize.transaction();
    try {
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!postId) throw new Error("Phải cung cấp postId");

      const where = { post_id: postId, user_id: userId };
      const existingLike = await models.reaction.findOne({ where, transaction });
      let result;

      if (existingLike && existingLike.type === "heart") {
        await models.reaction.destroy({ where, transaction });
        result = { isLiked: false };
      } else {
        if (existingLike) {
          await models.reaction.update(
            { type: "heart" },
            { where: { reaction_id: existingLike.reaction_id }, transaction }
          );
        } else {
          await models.reaction.create(
            {
              post_id: postId,
              user_id: userId,
              type: "heart",
            },
            { transaction }
          );
        }
        result = { isLiked: true };
      }

      result.likeCount = await models.reaction.count({
        where: { post_id: postId, type: "heart" },
        transaction,
      });

      await transaction.commit();
      return {
        status: "success",
        data: result,
        message: result.isLiked ? "Thích thành công" : "Bỏ thích thành công",
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`[${new Date().toISOString()}] Error in toggleLike: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Báo cáo bài viết
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} postId - ID bài viết
   * @param {number} userId - ID người dùng
   * @param {string} reason - Lý do báo cáo
   * @returns {Promise<Object>} - Báo cáo vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc bài viết đã được báo cáo
   */
  static async reportPost(req, postId, userId, reason) {
    try {
      if (!postId || isNaN(postId)) throw new Error("ID bài viết không hợp lệ");
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!reason || reason.trim() === "") throw new Error("Lý do báo cáo không được để trống");
      if (reason.length > 1000) throw new Error("Lý do báo cáo quá dài (tối đa 1,000 ký tự)");

      const post = await models.communitypost.findByPk(postId);
      if (!post) throw new Error("Không tìm thấy bài viết");

      const existed = await models.report.findOne({ where: { post_id: postId, user_id: userId } });
      if (existed) throw new Error("Bạn đã báo cáo bài viết này rồi");

      const report = await models.report.create({
        post_id: postId,
        user_id: userId,
        reason,
        reported_at: new Date(),
      });

      return {
        status: "success",
        data: report,
        message: "Báo cáo bài viết thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in reportPost: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Lấy tất cả báo cáo (admin only)
   * @param {Object} req - Yêu cầu HTTP
   * @returns {Promise<Object>} - Danh sách báo cáo
   * @throws {Error} - Nếu không có quyền hoặc truy vấn thất bại
   */
  static async getAllReports(req) {
    CommunityController.checkPermission(req, "admin");
    try {
      const reports = await models.report.findAll({
        include: [
          {
            model: models.communitypost,
            attributes: ["post_id", "content"],
            as: "post",
            include: [
              {
                model: models.user,
                attributes: ["user_id", "username"],
                as: "user"
              }
            ]
          },
          { model: models.user, attributes: ["user_id", "username"], as: "user" },
        ],
        order: [["reported_at", "DESC"]],
        attributes: ["report_id", "post_id", "user_id", "reason", "reported_at"],
      });

      return {
        status: "success",
        data: reports,
        message: "Lấy danh sách báo cáo thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in getAllReports: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Xóa bài viết (admin only)
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} postId - ID bài viết
   * @returns {Promise<Object>} - Kết quả xóa
   * @throws {Error} - Nếu không có quyền hoặc truy vấn thất bại
   */
  static async adminDeletePost(req, postId) {
    CommunityController.checkPermission(req, "admin");
    const transaction = await sequelize.transaction();
    try {
      if (!postId || isNaN(postId)) throw new Error("ID bài viết không hợp lệ");
      await models.comment.destroy({ where: { post_id: postId }, transaction });
      await models.reaction.destroy({ where: { post_id: postId }, transaction });
      await models.report.destroy({ where: { post_id: postId }, transaction });
      const deleted = await models.communitypost.destroy({ where: { post_id: postId }, transaction });
      if (!deleted) throw new Error("Không thể xóa bài viết");

      await transaction.commit();
      return {
        status: "success",
        data: null,
        message: "Xóa bài viết thành công",
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`[${new Date().toISOString()}] Error in adminDeletePost: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Giải quyết báo cáo (admin only)
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} reportId - ID báo cáo
   * @param {string} action - Hành động ('resolve' hoặc 'reject')
   * @returns {Promise<Object>} - Kết quả giải quyết
   * @throws {Error} - Nếu không có quyền hoặc truy vấn thất bại
   */
  static async resolveReport(req, reportId, action) {
    CommunityController.checkPermission(req, "admin");
    const transaction = await sequelize.transaction();
    try {
      if (!reportId || isNaN(reportId)) throw new Error("ID báo cáo không hợp lệ");
      if (!action || !['resolve', 'reject'].includes(action)) {
        throw new Error("Hành động không hợp lệ (phải là 'resolve' hoặc 'reject')");
      }

      const report = await models.report.findByPk(reportId, { transaction });
      if (!report) throw new Error("Không tìm thấy báo cáo");

      if (action === 'resolve') {
        // Xóa bài viết và tất cả dữ liệu liên quan
        await models.comment.destroy({ where: { post_id: report.post_id }, transaction });
        await models.reaction.destroy({ where: { post_id: report.post_id }, transaction });
        await models.report.destroy({ where: { post_id: report.post_id }, transaction });
        await models.communitypost.destroy({ where: { post_id: report.post_id }, transaction });

        await transaction.commit();
        return {
          status: "success",
          data: null,
          message: "Đã giải quyết báo cáo và xóa bài viết",
        };
      } else {
        // Chỉ xóa báo cáo này
        await models.report.destroy({ where: { report_id: reportId }, transaction });

        await transaction.commit();
        return {
          status: "success",
          data: null,
          message: "Đã từ chối báo cáo",
        };
      }
    } catch (error) {
      await transaction.rollback();
      console.error(`[${new Date().toISOString()}] Error in resolveReport: ${error.message}`);
      throw new Error(error.message);
    }
  }
}

module.exports = CommunityController;