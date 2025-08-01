const express = require("express");
const GameController = require("../controller/gameController");
const { authenticateToken,authenticateUser } = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * Router quản lý các API liên quan đến trò chơi học tập trên website học tiếng Anh
 */

// Game routes
router.get("/", authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    if (limit < 1 || offset < 0) {
      return res.status(400).json({ status: "error", message: "Limit hoặc offset không hợp lệ" });
    }
    const result = await GameController.getAll(req, limit, offset);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
      pagination: {
        limit,
        offset,
        count: result.data.length,
      },
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /games: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return res.status(400).json({ status: "error", message: "ID trò chơi không hợp lệ" });
    }
    const result = await GameController.getById(req, id);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /games/${req.params.id}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/topic/:topicId", authenticateUser, async (req, res) => {
  try {
    const { topicId } = req.params;
    if (isNaN(topicId)) {
      return res.status(400).json({ status: "error", message: "ID chủ đề không hợp lệ" });
    }
    const result = await GameController.getByTopic(req, topicId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /games/topic/${req.params.topicId}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") ? 400 : error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { topic_id, title, description } = req.body;
    const result = await GameController.create(req, { topic_id, title, description });
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /games: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Tiêu đề") || error.message.includes("Mô tả") || error.message.includes("Không tìm thấy")
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

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { topic_id, title, description } = req.body;
    if (isNaN(id)) {
      return res.status(400).json({ status: "error", message: "ID trò chơi không hợp lệ" });
    }
    const result = await GameController.update(req, id, { topic_id, title, description });
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /games/${req.params.id}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Tiêu đề") || error.message.includes("Mô tả") || error.message.includes("Không tìm thấy")
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

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return res.status(400).json({ status: "error", message: "ID trò chơi không hợp lệ" });
    }
    const result = await GameController.delete(req, id);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /games/${req.params.id}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy")
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

// Gameplay routes
router.post("/play", authenticateUser, async (req, res) => {
  try {
    const { userId, gameId, score } = req.body;
    if (isNaN(userId) || isNaN(gameId) || isNaN(score)) {
      return res.status(400).json({ status: "error", message: "Dữ liệu không hợp lệ" });
    }
    const result = await GameController.recordGameplay(req, userId, gameId, score);
    return res.status(201).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /games/play: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy")
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

router.get("/history/:userId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const gameId = req.query.gameId ? parseInt(req.query.gameId) : null;
    if (isNaN(userId) || (gameId && isNaN(gameId))) {
      return res.status(400).json({ status: "error", message: "ID người dùng hoặc trò chơi không hợp lệ" });
    }
    const result = await GameController.getUserGameHistory(req, userId, gameId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /games/history/${req.params.userId}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy")
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

router.get("/highscore/:userId/:gameId", authenticateUser, async (req, res) => {
  try {
    const { userId, gameId } = req.params;
    if (isNaN(userId) || isNaN(gameId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng hoặc trò chơi không hợp lệ" });
    }
    const result = await GameController.getUserHighScore(req, userId, gameId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /games/highscore/${req.params.userId}/${req.params.gameId}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy")
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

router.get("/leaderboard/:gameId", authenticateUser, async (req, res) => {
  try {
    const { gameId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    if (isNaN(gameId) || limit < 1) {
      return res.status(400).json({ status: "error", message: "ID trò chơi hoặc limit không hợp lệ" });
    }
    const result = await GameController.getGameLeaderboard(req, gameId, limit);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /games/leaderboard/${req.params.gameId}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/stats/:gameId", authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.params;
    if (isNaN(gameId)) {
      return res.status(400).json({ status: "error", message: "ID trò chơi không hợp lệ" });
    }
    const result = await GameController.getGameStats(req, gameId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /games/stats/${req.params.gameId}: ${error.message}`);
    const statusCode = error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy") ? 400 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;