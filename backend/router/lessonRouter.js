const express = require("express");
const LessonController = require("../controller/lessonController");
const { authenticateToken, authenticateUser } = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * Router quản lý các API liên quan đến bài học, bài tập và chủ đề trên website học tiếng Anh
 */

// Grammar Lessons routes
router.get("/grammar", authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || undefined;
    const offset = parseInt(req.query.offset) || undefined;
    if (limit < 1 || offset < 0) {
      return res.status(400).json({ status: "error", message: "Limit hoặc offset không hợp lệ" });
    }
    const result = await LessonController.getAllGrammarLessons({ limit, offset });
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
    console.error(`[${new Date().toISOString()}] Error in GET /lessons/grammar: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/grammar/:lessonId", authenticateUser, async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (isNaN(lessonId)) {
      return res.status(400).json({ status: "error", message: "ID bài học không hợp lệ" });
    }
    const result = await LessonController.getGrammarLessonById(lessonId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /lessons/grammar/${req.params.lessonId}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/grammar", authenticateToken, async (req, res) => {
  try {
    const lessonData = req.body;
    const userRole = req.user.role;
    const result = await LessonController.createGrammarLesson(lessonData, userRole);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /lessons/grammar: ${error.message}`);
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

router.put("/grammar/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lessonData = req.body;
    const userRole = req.user.role;
    if (isNaN(lessonId)) {
      return res.status(400).json({ status: "error", message: "ID bài học không hợp lệ" });
    }
    const result = await LessonController.updateGrammarLesson(lessonId, lessonData, userRole);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /lessons/grammar/${req.params.lessonId}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy")
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

router.delete("/grammar/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userRole = req.user.role;
    if (isNaN(lessonId)) {
      return res.status(400).json({ status: "error", message: "ID bài học không hợp lệ" });
    }
    const result = await LessonController.deleteGrammarLesson(lessonId, userRole);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /lessons/grammar/${req.params.lessonId}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy")
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

// Vocabulary Lessons routes
router.get("/vocabulary", authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || undefined;
    const offset = parseInt(req.query.offset) || undefined;
    if (limit < 1 || offset < 0) {
      return res.status(400).json({ status: "error", message: "Limit hoặc offset không hợp lệ" });
    }
    const result = await LessonController.getAllVocabularyLessons({ limit, offset });
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
    console.error(`[${new Date().toISOString()}] Error in GET /lessons/vocabulary: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/vocabulary/:lessonId", authenticateUser, async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (isNaN(lessonId)) {
      return res.status(400).json({ status: "error", message: "ID bài học không hợp lệ" });
    }
    const result = await LessonController.getVocabularyLessonById(lessonId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /lessons/vocabulary/${req.params.lessonId}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/vocabulary", authenticateToken, async (req, res) => {
  try {
    const lessonData = req.body;
    const userRole = req.user.role;
    const result = await LessonController.createVocabularyLesson(lessonData, userRole);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /lessons/vocabulary: ${error.message}`);
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

router.put("/vocabulary/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lessonData = req.body;
    const userRole = req.user.role;
    if (isNaN(lessonId)) {
      return res.status(400).json({ status: "error", message: "ID bài học không hợp lệ" });
    }
    const result = await LessonController.updateVocabularyLesson(lessonId, lessonData, userRole);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /lessons/vocabulary/${req.params.lessonId}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy")
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

router.delete("/vocabulary/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userRole = req.user.role;
    if (isNaN(lessonId)) {
      return res.status(400).json({ status: "error", message: "ID bài học không hợp lệ" });
    }
    const result = await LessonController.deleteVocabularyLesson(lessonId, userRole);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /lessons/vocabulary/${req.params.lessonId}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy")
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

// Exercises routes
router.get("/exercises", authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || undefined;
    const offset = parseInt(req.query.offset) || undefined;
    if (limit < 1 || offset < 0) {
      return res.status(400).json({ status: "error", message: "Limit hoặc offset không hợp lệ" });
    }
    const result = await LessonController.getAllExercises({ limit, offset });
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
    console.error(`[${new Date().toISOString()}] Error in GET /lessons/exercises: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/exercises/:exerciseId", authenticateUser, async (req, res) => {
  try {
    const { exerciseId } = req.params;
    if (isNaN(exerciseId)) {
      return res.status(400).json({ status: "error", message: "ID bài tập không hợp lệ" });
    }
    const result = await LessonController.getExerciseById(exerciseId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /lessons/exercises/${req.params.exerciseId}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/exercises/type/:lessonType/:lessonId", authenticateUser, async (req, res) => {
  try {
    const { lessonType, lessonId } = req.params;
    if (!["grammar", "vocab", "skill"].includes(lessonType) || isNaN(lessonId)) {
      return res.status(400).json({ status: "error", message: "Loại bài học hoặc ID bài học không hợp lệ" });
    }
    const result = await LessonController.getExercisesByType(lessonType, lessonId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /lessons/exercises/type/${req.params.lessonType}/${req.params.lessonId}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/exercises", authenticateToken, async (req, res) => {
  try {
    const exerciseData = req.body;
    const userRole = req.user.role;
    const result = await LessonController.createExercise(exerciseData, userRole);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /lessons/exercises: ${error.message}`);
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

router.put("/exercises/:exerciseId", authenticateToken, async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const exerciseData = req.body;
    const userRole = req.user.role;
    if (isNaN(exerciseId)) {
      return res.status(400).json({ status: "error", message: "ID bài tập không hợp lệ" });
    }
    const result = await LessonController.updateExercise(exerciseId, exerciseData, userRole);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /lessons/exercises/${req.params.exerciseId}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy")
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

router.delete("/exercises/:exerciseId", authenticateToken, async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const userRole = req.user.role;
    if (isNaN(exerciseId)) {
      return res.status(400).json({ status: "error", message: "ID bài tập không hợp lệ" });
    }
    const result = await LessonController.deleteExercise(exerciseId, userRole);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /lessons/exercises/${req.params.exerciseId}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy")
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

// Lưu kết quả làm bài tập (exercise) cho các bài học ngữ pháp, từ vựng, nghe, đọc
router.post("/exercisesubmission", authenticateUser, async (req, res) => {
  try {
    const { exercise_id, user_answer } = req.body;
    const userId = req.user.user_id;
    if (!exercise_id || !user_answer) {
      return res.status(400).json({ status: "error", message: "Thiếu exercise_id hoặc user_answer" });
    }
    const result = await LessonController.submitExerciseSubmission(userId, exercise_id, user_answer);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /exercisesubmission: ${error.message}`);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Progress routes
router.post("/progress", authenticateUser, async (req, res) => {
  try {
    const progressData = req.body;
    progressData.user_id = req.user.user_id;

    // Validate required fields
    if (!progressData.lesson_type) {
      return res.status(400).json({
        status: "error",
        message: "Thiếu thông tin lesson_type"
      });
    }

    if (!progressData.lesson_id && !progressData.skill_id) {
      return res.status(400).json({
        status: "error",
        message: "Thiếu thông tin lesson_id hoặc skill_id"
      });
    }

    const result = await LessonController.updateProgress(progressData);
    return res.status(200).json({
      status: result.status,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /lessons/progress: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Route để lấy thông tin tiến độ và câu trả lời đã nộp
router.get("/progress/:lessonId/:lessonType", authenticateUser, async (req, res) => {
  try {
    const { lessonId, lessonType } = req.params;
    const userId = req.user.user_id;

    if (isNaN(lessonId)) {
      return res.status(400).json({
        status: "error",
        message: "ID bài học không hợp lệ"
      });
    }

    const result = await LessonController.getLessonProgressAndAnswers(userId, parseInt(lessonId), lessonType);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /lessons/progress/${req.params.lessonId}/${req.params.lessonType}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;