const express = require("express");
const LearningProgressController = require("../controller/learningProgressController");
const { authenticateToken, authenticateUser } = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * Router quản lý các API liên quan đến tiến trình học tập của người dùng trên website học tiếng Anh
 */

// Get All Learning Progress route (admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await LearningProgressController.getAll(req);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /learning-progress: ${error.message}`);
    const statusCode = error.message.includes("Quyền bị từ chối") ? 403 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get Learning Progress by User ID route
router.get("/user/:userId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    const result = await LearningProgressController.getByUserId(req, userId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /learning-progress/user/${req.params.userId}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không có quyền")
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

// Get Learning Progress by Lesson Type route
router.get("/user/:userId/lesson-type/:lessonType", authenticateUser, async (req, res) => {
  try {
    const { userId, lessonType } = req.params;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    if (!lessonType || lessonType.trim() === "") {
      return res.status(400).json({ status: "error", message: "Loại bài học không được để trống" });
    }
    const validLessonTypes = ["vocabulary", "grammar", "speaking", "listening", "reading", "writing", "quiz"];
    if (!validLessonTypes.includes(lessonType)) {
      return res.status(400).json({ status: "error", message: "Loại bài học không hợp lệ" });
    }
    const result = await LearningProgressController.getByLessonType(req, userId, lessonType);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /learning-progress/user/${req.params.userId}/lesson-type/${req.params.lessonType}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không có quyền")
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

// Update Learning Progress route
router.put("/update", authenticateUser, async (req, res) => {
  try {
    const { userId, lessonType, lessonId, progressPercent } = req.body;
    if (isNaN(userId) || !lessonType || lessonType.trim() === "" || isNaN(lessonId) || isNaN(progressPercent) || progressPercent < 0 || progressPercent > 100) {
      return res.status(400).json({ status: "error", message: "Dữ liệu đầu vào không hợp lệ" });
    }
    const result = await LearningProgressController.updateProgress(req, userId, lessonType, lessonId, progressPercent);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /learning-progress/update: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy") || error.message.includes("Không có quyền")
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