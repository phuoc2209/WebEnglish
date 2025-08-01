const express = require("express");
const StrengthWeaknessController = require("../controller/strengthWeaknessController");
const { authenticateToken,authenticateUser } = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * Router quản lý các API liên quan đến điểm mạnh và điểm yếu của người dùng trên website học tiếng Anh
 */

// Get Strength/Weakness by User ID route
router.get("/user/:userId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    const result = await StrengthWeaknessController.getByUserId(req, userId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /strength-weakness/user/${req.params.userId}: ${error.message}`);
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

// Get Strength/Weakness by User and Skill Type route
router.get("/user/:userId/skill/:skillType", authenticateUser, async (req, res) => {
  try {
    const { userId, skillType } = req.params;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    if (!skillType || skillType.trim() === "") {
      return res.status(400).json({ status: "error", message: "Loại kỹ năng không được để trống" });
    }
    const validSkillTypes = ["listening", "speaking", "reading", "writing"];
    if (!validSkillTypes.includes(skillType)) {
      return res.status(400).json({ status: "error", message: "Loại kỹ năng không hợp lệ" });
    }
    const result = await StrengthWeaknessController.getByUserAndSkill(req, userId, skillType);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /strength-weakness/user/${req.params.userId}/skill/${req.params.skillType}: ${error.message}`);
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

// Get User Skill Analysis route
router.get('/user/:userId/analysis', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    if (isNaN(userId)) {
      return res.status(400).json({ status: 'error', message: 'ID người dùng không hợp lệ' });
    }
    console.log('req.user:', req.user); // Debug
    const result = await StrengthWeaknessController.getUserSkillAnalysis(req, parseInt(userId));
    return res.status(200).json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /strength-weakness/user/${req.params.userId}/analysis: ${error.message}`);
    return res.status(error.status || 500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Update or Create Strength/Weakness route (admin only)
router.put("/user/:userId/skill/:skillType", authenticateToken, async (req, res) => {
  try {
    const { userId, skillType } = req.params;
    const { strength, weakness } = req.body;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    if (!skillType || skillType.trim() === "") {
      return res.status(400).json({ status: "error", message: "Loại kỹ năng không được để trống" });
    }
    const validSkillTypes = ["listening", "speaking", "reading", "writing"];
    if (!validSkillTypes.includes(skillType)) {
      return res.status(400).json({ status: "error", message: "Loại kỹ năng không hợp lệ" });
    }
    if ((strength && strength.length > 1000) || (weakness && weakness.length > 1000)) {
      return res.status(400).json({ status: "error", message: "Điểm mạnh/yếu quá dài (tối đa 1000 ký tự)" });
    }
    const data = { strength, weakness };
    const result = await StrengthWeaknessController.updateOrCreate(req, userId, skillType, data);
    return res.status(result.data.created_at === result.data.updated_at ? 201 : 200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /strength-weakness/user/${req.params.userId}/skill/${req.params.skillType}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy") || error.message.includes("quá dài")
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