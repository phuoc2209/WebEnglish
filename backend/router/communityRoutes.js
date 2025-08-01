const express = require("express");
const CommunityController = require("../controller/communityController");
const { authenticateToken, authenticateUser } = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * Router quản lý các API liên quan đến cộng đồng (bài viết, bình luận, thả tim, báo cáo, quản trị) trên website học tiếng Anh
 */

// routes/community.routes.js
router.get("/posts", authenticateUser, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({ status: "error", message: "Page hoặc limit không hợp lệ" });
    }

    const result = await CommunityController.getAllPosts(req, page, limit);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /posts: ${error.message}`);
    const statusCode =
      error.message.includes("Không tìm thấy") ? 404 :
        error.message.includes("không hợp lệ") ? 400 : 500;

    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});


router.get("/posts/:postId", authenticateUser, async (req, res) => {
  try {
    const { postId } = req.params;
    if (isNaN(postId)) {
      return res.status(400).json({ status: "error", message: "ID bài viết không hợp lệ" });
    }
    const result = await CommunityController.getPostById(req, postId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /posts/${req.params.postId}: ${error.message}`);
    const statusCode = error.message.includes("Không tìm thấy") ? 404 : error.message.includes("không hợp lệ") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/posts", authenticateUser, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.user_id;
    const result = await CommunityController.createPost(req, userId, content);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /posts: ${error.message}`);
    const statusCode =
      error.message.includes("Nội dung") || error.message.includes("không hợp lệ") || error.message.includes("bị cấm")
        ? 400
        : error.message.includes("Quyền")
          ? 403
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.put("/posts/:postId", authenticateUser, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (isNaN(postId)) {
      return res.status(400).json({ status: "error", message: "ID bài viết không hợp lệ" });
    }
    const result = await CommunityController.updatePost(req, postId, content);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /posts/${req.params.postId}: ${error.message}`);
    const statusCode =
      error.message.includes("Nội dung") || error.message.includes("không hợp lệ")
        ? 400
        : error.message.includes("Quyền")
          ? 403
          : error.message.includes("Không tìm thấy")
            ? 404
            : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.delete("/posts/:postId", authenticateUser, async (req, res) => {
  try {
    const { postId } = req.params;
    if (isNaN(postId)) {
      return res.status(400).json({ status: "error", message: "ID bài viết không hợp lệ" });
    }
    const result = await CommunityController.deletePost(req, postId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /posts/${req.params.postId}: ${error.message}`);
    const statusCode =
      error.message.includes("Quyền")
        ? 403
        : error.message.includes("Không tìm thấy") || error.message.includes("không hợp lệ")
          ? 404
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Admin post deletion
router.delete("/admin/posts/:postId", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    if (isNaN(postId)) {
      return res.status(400).json({ status: "error", message: "ID bài viết không hợp lệ" });
    }
    const result = await CommunityController.adminDeletePost(req, postId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /admin/posts/${req.params.postId}: ${error.message}`);
    const statusCode =
      error.message.includes("Quyền")
        ? 403
        : error.message.includes("Không tìm thấy") || error.message.includes("không hợp lệ")
          ? 404
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Comments routes
router.post("/posts/:postId/comments", authenticateUser, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.user_id;
    if (isNaN(postId)) {
      return res.status(400).json({ status: "error", message: "ID bài viết không hợp lệ" });
    }
    const result = await CommunityController.createComment(req, postId, userId, content);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /posts/${req.params.postId}/comments: ${error.message}`);
    const statusCode =
      error.message.includes("Nội dung") || error.message.includes("Không tìm thấy") || error.message.includes("không hợp lệ") || error.message.includes("bị cấm")
        ? 400
        : error.message.includes("Quyền")
          ? 403
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.put("/comments/:commentId", authenticateUser, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    if (isNaN(commentId)) {
      return res.status(400).json({ status: "error", message: "ID bình luận không hợp lệ" });
    }
    const result = await CommunityController.updateComment(req, commentId, content);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /comments/${req.params.commentId}: ${error.message}`);
    const statusCode =
      error.message.includes("Nội dung") || error.message.includes("không hợp lệ")
        ? 400
        : error.message.includes("Quyền")
          ? 403
          : error.message.includes("Không tìm thấy")
            ? 404
            : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.delete("/comments/:commentId", authenticateUser, async (req, res) => {
  try {
    const { commentId } = req.params;
    if (isNaN(commentId)) {
      return res.status(400).json({ status: "error", message: "ID bình luận không hợp lệ" });
    }
    const result = await CommunityController.deleteComment(req, commentId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /comments/${req.params.commentId}: ${error.message}`);
    const statusCode =
      error.message.includes("Quyền")
        ? 403
        : error.message.includes("Không tìm thấy") || error.message.includes("không hợp lệ")
          ? 404
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Reactions routes
router.post("/posts/:postId/like", authenticateUser, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.user_id;
    if (isNaN(postId)) {
      return res.status(400).json({ status: "error", message: "ID bài viết không hợp lệ" });
    }
    const result = await CommunityController.toggleLike(req, { postId }, userId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /posts/${req.params.postId}/like: ${error.message}`);
    const statusCode =
      error.message.includes("Không tìm thấy") || error.message.includes("không hợp lệ") ? 400 : error.message.includes("Quyền") ? 403 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/comments/:commentId/like", authenticateUser, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.user_id;
    if (isNaN(commentId)) {
      return res.status(400).json({ status: "error", message: "ID bình luận không hợp lệ" });
    }
    const result = await CommunityController.toggleLike(req, { commentId }, userId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /comments/${req.params.commentId}/like: ${error.message}`);
    const statusCode =
      error.message.includes("Không tìm thấy") || error.message.includes("không hợp lệ") ? 400 : error.message.includes("Quyền") ? 403 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Reports routes
router.post("/posts/:postId/reports", authenticateUser, async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;
    const userId = req.user.user_id;
    if (isNaN(postId)) {
      return res.status(400).json({ status: "error", message: "ID bài viết không hợp lệ" });
    }
    const result = await CommunityController.reportPost(req, postId, userId, reason);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /posts/${req.params.postId}/reports: ${error.message}`);
    const statusCode =
      error.message.includes("Lý do") || error.message.includes("Không tìm thấy") || error.message.includes("báo cáo") || error.message.includes("không hợp lệ")
        ? 400
        : error.message.includes("Quyền")
          ? 403
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/reports", authenticateUser, async (req, res) => {
  try {
    const result = await CommunityController.getAllReports(req);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /reports: ${error.message}`);
    const statusCode =
      error.message.includes("Quyền") ? 403 : error.message.includes("không hợp lệ") ? 400 : error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Admin warning and ban routes
router.post("/users/:userId/warn", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    const result = await CommunityController.warnUser(req, userId, message);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /users/${req.params.userId}/warn: ${error.message}`);
    const statusCode =
      error.message.includes("Nội dung") || error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy")
        ? 400
        : error.message.includes("Quyền")
          ? 403
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/users/:userId/ban", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    const result = await CommunityController.banUserFromPosting(req, userId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /users/${req.params.userId}/ban: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy") || error.message.includes("đã bị cấm")
        ? 400
        : error.message.includes("Quyền")
          ? 403
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/users/:userId/unban", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    const result = await CommunityController.unbanUserFromPosting(req, userId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /users/${req.params.userId}/unban: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy") || error.message.includes("không bị cấm")
        ? 400
        : error.message.includes("Quyền")
          ? 403
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/banned-users", authenticateToken, async (req, res) => {
  try {
    const result = await CommunityController.getBannedUsers(req);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /banned-users: ${error.message}`);
    const statusCode =
      error.message.includes("Quyền") ? 403 : error.message.includes("không hợp lệ") ? 400 : error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Resolve report route
router.post("/reports/:reportId/resolve", authenticateToken, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action } = req.body;

    if (isNaN(reportId)) {
      return res.status(400).json({ status: "error", message: "ID báo cáo không hợp lệ" });
    }

    if (!action || !['resolve', 'reject'].includes(action)) {
      return res.status(400).json({ status: "error", message: "Hành động không hợp lệ" });
    }

    const result = await CommunityController.resolveReport(req, reportId, action);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /reports/${req.params.reportId}/resolve: ${error.message}`);
    const statusCode =
      error.message.includes("Quyền") ? 403 :
        error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;