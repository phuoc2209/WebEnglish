const express = require("express");
const SkillController = require("../controller/skillController");
const { authenticateToken, authenticateUser } = require("../middlewares/authMiddleware");
const multer = require("multer");
const router = express.Router();
const { getAverageScoreByUserId } = require('../controller/skillController');

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/' });

/**
 * Router quản lý các API liên quan đến bài học kỹ năng và phản hồi người dùng trên website học tiếng Anh
 */

// Get all Skill Lessons route
router.get("/", authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || undefined;
    const offset = parseInt(req.query.offset) || undefined;
    const skillType = req.query.skillType;
    if (limit < 1 || offset < 0) {
      return res.status(400).json({ status: "error", message: "Limit hoặc offset không hợp lệ" });
    }
    const result = await SkillController.getAll({ limit, offset, skillType });
    return res.status(200).json({
      status: result.status,
      data: result.data.rows,
      message: result.message,
      pagination: {
        limit,
        offset,
        total: result.data.count,
      },
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /skills: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get Skill Lesson by ID route
router.get("/:skillId", authenticateUser, async (req, res) => {
  try {
    const { skillId } = req.params;
    if (isNaN(skillId)) {
      return res.status(400).json({ status: "error", message: "ID bài học không hợp lệ" });
    }
    const result = await SkillController.getById(skillId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /skills/${req.params.skillId}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get Skill Lessons by Type route
router.get("/type/:skillType", authenticateUser, async (req, res) => {
  try {
    const { skillType } = req.params;
    const validSkillTypes = ["listening", "speaking", "reading", "writing"];
    if (!validSkillTypes.includes(skillType)) {
      return res.status(400).json({ status: "error", message: "Loại kỹ năng không hợp lệ" });
    }
    const result = await SkillController.getByType(skillType);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /skills/type/${req.params.skillType}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Create Skill Lesson route (admin only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description, skill_type, reading_content, writing_prompt, suggested_vocabulary, examples } = req.body;
    if (!title || !description || !skill_type) {
      return res.status(400).json({ status: "error", message: "Thiếu các trường bắt buộc: title, description, skill_type" });
    }
    const data = { title, description, skill_type, reading_content, writing_prompt, suggested_vocabulary, examples };
    const result = await SkillController.create(data, req.user.role);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /skills: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Thiếu các trường")
        ? 400
        : error.message.includes("Không có quyền")
          ? 403
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Update Skill Lesson route (admin only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, skill_type, reading_content, writing_prompt, suggested_vocabulary, examples } = req.body;
    if (isNaN(id)) {
      return res.status(400).json({ status: "error", message: "ID bài học không hợp lệ" });
    }
    const data = { title, description, skill_type, reading_content, writing_prompt, suggested_vocabulary, examples };
    const result = await SkillController.update(id, data, req.user.role);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /skills/${req.params.id}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("không tìm thấy")
        ? 400
        : error.message.includes("Không có quyền")
          ? 403
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Delete Skill Lesson route (admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return res.status(400).json({ status: "error", message: "ID bài học không hợp lệ" });
    }
    const result = await SkillController.delete(id, req.user.role);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /skills/${req.params.id}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("không tìm thấy")
        ? 400
        : error.message.includes("Không có quyền")
          ? 403
          : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Submit Skill Submission route (general route for all skill types)
router.post("/submissions", authenticateUser, upload.single('audio'), async (req, res) => {
  try {
    const { user_id, skill_id, skill_type, question, options, user_answer, is_correct, content, ai_grading_result } = req.body;

    if (!user_id || !skill_id || !skill_type) {
      return res.status(400).json({ status: "error", message: "Thiếu các trường bắt buộc: user_id, skill_id, skill_type" });
    }

    if (req.user.user_id !== parseInt(user_id) && req.user.role !== "admin") {
      return res.status(403).json({ status: "error", message: "Không có quyền nộp bài cho người dùng này" });
    }

    let submissionData = {
      question,
      options,
      user_answer,
      is_correct,
      content,
      ai_grading_result
    };

    // Add audio file path if present
    if (req.file) {
      submissionData.audio_file = req.file.path;
    }

    let result;
    if (skill_type === 'speaking') {
      result = await SkillController.submitSpeakingSubmission(parseInt(user_id), parseInt(skill_id), submissionData);
    } else if (skill_type === 'writing') {
      result = await SkillController.submitWritingSubmission(parseInt(user_id), parseInt(skill_id), submissionData);
    } else if (skill_type === 'listening') {
      result = await SkillController.submitListeningResponse(parseInt(user_id), parseInt(skill_id), submissionData);
    } else if (skill_type === 'reading') {
      result = await SkillController.submitReadingResponse(parseInt(user_id), parseInt(skill_id), submissionData);
    } else {
      return res.status(400).json({ status: "error", message: "Loại kỹ năng không hợp lệ" });
    }

    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /skills/submissions: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") || error.message.includes("Thiếu các trường") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// API lấy điểm trung bình từng kỹ năng cho user
router.get('/submissions/average-score/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    if (isNaN(userId)) {
      return res.status(400).json({ status: 'error', message: 'ID người dùng không hợp lệ' });
    }
    if (req.user.user_id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Không có quyền truy cập điểm số của người dùng này' });
    }
    const data = await getAverageScoreByUserId(parseInt(userId));
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;