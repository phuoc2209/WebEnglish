const express = require("express");
const TestController = require("../controller/testController");
const { authenticateToken, authenticateUser } = require("../middlewares/authMiddleware");
const multer = require("multer");
const logger = require('winston');
const router = express.Router();

// Cấu hình multer để xử lý file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes("spreadsheet") || file.originalname.endsWith(".xlsx")) {
      cb(null, true);
    } else {
      cb(new Error("Vui lòng tải lên file Excel (.xlsx)"), false);
    }
  },
});

/**
 * Router quản lý các API liên quan đến bài kiểm tra, câu hỏi và phản hồi người dùng trên website học tiếng Anh
 */

// Quizzes routes
router.get("/quizzes", authenticateUser, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, isPublic } = req.query;
    if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
      return res.status(400).json({ status: "error", message: "Page hoặc pageSize không hợp lệ" });
    }
    const params = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      isPublic: isPublic !== undefined ? isPublic === "true" : undefined,
    };
    const result = await TestController.getAllQuizzes(params);
    return res.status(200).json({
      status: result.status,
      data: {
        rows: result.data.rows,
        count: result.data.count
      },
      message: result.message,
      pagination: {
        page,
        pageSize,
        total: result.data.count,
      },
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /tests/quizzes: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/quizzes/:quizId", authenticateUser, async (req, res) => {
  try {
    const { quizId } = req.params;
    if (isNaN(quizId)) {
      return res.status(400).json({ status: "error", message: "ID bài kiểm tra không hợp lệ" });
    }
    const result = await TestController.getQuizById(quizId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /tests/quizzes/${req.params.quizId}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") || error.message.includes("không tìm thấy") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/quizzes", authenticateToken, async (req, res) => {
  try {
    const quizData = req.body;
    const userRole = req.user.role;
    if (!quizData.title || !quizData.user_id) {
      return res.status(400).json({ status: "error", message: "Thiếu các trường bắt buộc" });
    }
    const result = await TestController.createQuiz(quizData, userRole);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /tests/quizzes: ${error.message}`);
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

// Update Quiz route
router.put("/quizzes/:quizId", authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const quizData = req.body;
    const userRole = req.user.role;

    if (isNaN(quizId)) {
      return res.status(400).json({ status: "error", message: "ID bài kiểm tra không hợp lệ" });
    }

    if (!quizData.title) {
      return res.status(400).json({ status: "error", message: "Thiếu trường bắt buộc: title" });
    }

    const result = await TestController.updateQuiz(quizId, quizData, userRole);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /tests/quizzes/${req.params.quizId}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Thiếu các trường")
        ? 400
        : error.message.includes("Không có quyền")
          ? 403
          : error.message.includes("không tìm thấy")
            ? 404
            : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.delete("/quizzes/:quizId", authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userRole = req.user.role;
    if (isNaN(quizId)) {
      return res.status(400).json({ status: "error", message: "ID bài kiểm tra không hợp lệ" });
    }
    const result = await TestController.deleteQuiz(quizId, userRole);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /tests/quizzes/${req.params.quizId}: ${error.message}`);
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

// Test Attempts routes
router.post("/attempts", authenticateUser, async (req, res) => {
  try {
    const { userId, quizId } = req.body;
    if (isNaN(userId) || isNaN(quizId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng hoặc ID bài kiểm tra không hợp lệ" });
    }
    const result = await TestController.createTestAttempt(userId, quizId);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /tests/attempts: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/attempts/user/:userId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { quizId } = req.query;
    if (isNaN(userId) || (quizId && isNaN(quizId))) {
      return res.status(400).json({ status: "error", message: "ID người dùng hoặc ID bài kiểm tra không hợp lệ" });
    }
    const result = await TestController.getUserTestAttempts(userId, quizId || null);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /tests/attempts/user/${req.params.userId}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Answer Submissions routes
router.post("/answers", authenticateUser, async (req, res) => {
  try {
    const { attemptId, questionId, userAnswer } = req.body;
    if (isNaN(attemptId) || isNaN(questionId) || !userAnswer || userAnswer.trim() === "") {
      return res.status(400).json({ status: "error", message: "Dữ liệu đầu vào không hợp lệ" });
    }
    const result = await TestController.submitAnswer(attemptId, questionId, userAnswer);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /tests/answers: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Thiếu các trường") || error.message.includes("Không tìm thấy")
        ? 400
        : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/answers/:attemptId", authenticateUser, async (req, res) => {
  try {
    const { attemptId } = req.params;
    if (isNaN(attemptId)) {
      return res.status(400).json({ status: "error", message: "ID lượt làm bài không hợp lệ" });
    }
    const result = await TestController.getAnswerSubmissions(attemptId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /tests/answers/${req.params.attemptId}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Test Score route
router.get("/score/:attemptId", authenticateUser, async (req, res) => {
  try {
    const { attemptId } = req.params;
    if (isNaN(attemptId)) {
      return res.status(400).json({ status: "error", message: "ID lượt làm bài không hợp lệ" });
    }
    const result = await TestController.calculateTestScore(attemptId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /tests/score/${req.params.attemptId}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Quiz Statistics route
router.get("/statistics/:quizId", authenticateUser, async (req, res) => {
  try {
    const { quizId } = req.params;
    if (isNaN(quizId)) {
      return res.status(400).json({ status: "error", message: "ID bài kiểm tra không hợp lệ" });
    }
    const result = await TestController.getQuizStatistics(quizId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /tests/statistics/${req.params.quizId}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Create quiz with random questions route
router.post("/quizzes/random", authenticateToken, async (req, res) => {
  try {
    // Kiểm tra quyền
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: "error",
        message: "Không có quyền tạo quiz"
      });
    }

    const quizData = {
      title: req.body.title,
      description: req.body.description,
      is_public: req.body.is_public || false,
      user_id: req.user.user_id,
    };

    const questionsConfig = {
      easy: req.body.easy || 0,
      medium: req.body.medium || 0,
      hard: req.body.hard || 0,
    };

    const result = await TestController.createQuizWithRandomQuestions(quizData, questionsConfig, req.user.role);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /tests/quizzes/random: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

// Generate random quiz route
router.post("/quizzes/generate", authenticateToken, async (req, res) => {
  try {
    // Kiểm tra quyền
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: "error",
        message: "Không có quyền generate quiz"
      });
    }

    const { easy = 5, medium = 3, hard = 2 } = req.body;
    const result = await TestController.generateRandomQuiz({ easy, medium, hard });
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /tests/quizzes/generate: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

// Import Quiz from Excel route
router.post("/quizzes/import", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const quizData = {
      title: req.body.title || "Bài kiểm tra nhập từ Excel",
      description: req.body.description,
      is_public: req.body.is_public === 'true',
      user_id: req.user.user_id,
    };
    const userRole = req.user.role;

    if (!file) {
      return res.status(400).json({ status: "error", message: "Không có file được tải lên" });
    }

    const result = await TestController.importQuizFromExcel(file, quizData, userRole);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /tests/quizzes/import: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") ||
        error.message.includes("Vui lòng tải lên") ||
        error.message.includes("Thiếu trường") ||
        error.message.includes("Không tìm thấy") ||
        error.message.includes("File Excel không chứa dữ liệu")
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

// Validate Quiz Excel route
router.post("/quizzes/validate", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    // Kiểm tra quyền
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: "error",
        message: "Không có quyền validate quiz"
      });
    }

    // Kiểm tra file
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        status: "error",
        message: "Không có file được tải lên"
      });
    }
    if (!file.mimetype.includes("spreadsheet") && !file.originalname.match(/\.(xlsx|xls)$/)) {
      return res.status(400).json({
        status: "error",
        message: "Vui lòng tải lên file Excel (.xlsx hoặc .xls)"
      });
    }

    // Validate file
    const result = await TestController.validateQuizExcel(file);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message || "Validate file thành công"
    });
  } catch (error) {
    logger.error(`[${new Date().toISOString()}] Error in POST /tests/quizzes/validate: ${error.message}`, { error });
    const statusCode = error.statusCode || (error.message.includes("không hợp lệ") || error.message.includes("Vui lòng tải lên") ? 400 : 500);
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
      errors: error.errors || []
    });
  }
});

module.exports = router;