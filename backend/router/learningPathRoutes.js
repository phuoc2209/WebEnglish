const express = require("express");
const LearningPathController = require("../controller/learningPathController");
const { authenticateToken, authenticateUser } = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * Router quản lý các API liên quan đến lộ trình học tập trên website học tiếng Anh
 */

// Get All Learning Paths route
router.get("/", authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    if (limit < 1 || offset < 0) {
      return res.status(400).json({ status: "error", message: "Limit hoặc offset không hợp lệ" });
    }
    const result = await LearningPathController.getAll(req, limit, offset);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
      pagination: {
        limit,
        offset,
        total: result.data.length,
      },
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /learning-paths: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get Learning Paths by User ID route
router.get('/user/:userId', authenticateUser, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const result = await LearningPathController.getByUserId(req, userId, limit, offset);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /learning-paths/user/${req.params.userId}: ${error.message}`);
    return res.status(error.status || 500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Generate recommended learning path route
router.post('/user/:userId/recommend', authenticateUser, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const result = await LearningPathController.generateRecommendedPath(req, userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /learning-paths/user/${req.params.userId}/recommend: ${error.message}`);
    return res.status(error.status || 500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Get skill-specific recommendations route
router.get('/user/:userId/skill/:skillType/recommendations', authenticateUser, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const skillType = req.params.skillType;

    const result = await LearningPathController.getSkillRecommendations(req, userId, skillType);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /learning-paths/user/${req.params.userId}/skill/${req.params.skillType}/recommendations: ${error.message}`);
    return res.status(error.status || 500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Search Learning Paths by Title route
router.get('/search', authenticateUser, async (req, res) => {
  try {
    const { title } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const result = await LearningPathController.searchByTitle(req, title, limit, offset);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /learning-paths/search: ${error.message}`);
    return res.status(error.status || 500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Create Learning Path route
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { user_id, path_title, description } = req.body;
    if (isNaN(user_id) || !path_title || path_title.trim() === "") {
      return res.status(400).json({ status: "error", message: "Dữ liệu đầu vào không hợp lệ" });
    }
    const data = { user_id, path_title, description };
    const result = await LearningPathController.create(req, data);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /learning-paths: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("quá dài") || error.message.includes("Không tìm thấy")
        ? 400
        : error.message.includes("Quyền bị từ chối")
          ? 403
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Update Learning Path route
router.put("/:pathId", authenticateToken, async (req, res) => {
  try {
    const { pathId } = req.params;
    const { path_title, description } = req.body;
    if (isNaN(pathId)) {
      return res.status(400).json({ status: "error", message: "ID lộ trình không hợp lệ" });
    }
    const data = { path_title, description };
    const result = await LearningPathController.update(req, pathId, data);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /learning-paths/${req.params.pathId}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("quá dài") || error.message.includes("Không tìm thấy") || error.message.includes("Không thể cập nhật")
        ? 400
        : error.message.includes("Quyền bị từ chối")
          ? 403
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Delete Learning Path route
router.delete("/:pathId", authenticateToken, async (req, res) => {
  try {
    const { pathId } = req.params;
    if (isNaN(pathId)) {
      return res.status(400).json({ status: "error", message: "ID lộ trình không hợp lệ" });
    }
    const result = await LearningPathController.delete(req, pathId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /learning-paths/${req.params.pathId}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy") || error.message.includes("Không thể xóa")
        ? 400
        : error.message.includes("Quyền bị từ chối")
          ? 403
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;