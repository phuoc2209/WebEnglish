const express = require("express");
const UserController = require("../controller/UserController");
const { authenticateToken, authenticateUser } = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * Router quản lý các API liên quan đến thông tin và hoạt động của người dùng trên website học tiếng Anh
 */

// Get All Users route (admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await UserController.getAll(req);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /users: ${error.message}`);
    const statusCode = error.message.includes("Quyền bị từ chối") ? 403 : 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get User by ID route
router.get("/:userId", authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "error", message: "Không xác thực được người dùng" });
    }
    const { userId } = req.params;
    const result = await UserController.getUserById(req, userId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /users/${req.params.userId}: ${error.message}`);
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

// Update User route
router.put("/:userId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, role } = req.body;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    if (username && (username.trim() === "" || username.length > 50)) {
      return res.status(400).json({ status: "error", message: "Username không hợp lệ (1-50 ký tự)" });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status: "error", message: "Email không hợp lệ" });
    }
    if (role && !["student", "admin"].includes(role)) {
      return res.status(400).json({ status: "error", message: "Vai trò không hợp lệ" });
    }
    const updateData = { username, email, role };
    const result = await UserController.update(req, userId, updateData);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /users/${req.params.userId}: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy") || error.message.includes("đã được sử dụng") || error.message.includes("Không có quyền")
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

// Update User Profile route
router.put("/:userId/profile", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, gender, birthdate } = req.body;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    if (full_name && (full_name.trim() === "" || full_name.length > 255)) {
      return res.status(400).json({ status: "error", message: "Họ tên không hợp lệ (1-255 ký tự)" });
    }
    if (gender && !["male", "female", "other"].includes(gender)) {
      return res.status(400).json({ status: "error", message: "Giới tính không hợp lệ" });
    }
    if (birthdate && new Date(birthdate) > new Date()) {
      return res.status(400).json({ status: "error", message: "Ngày sinh không được là tương lai" });
    }
    const profileData = { full_name, gender, birthdate };
    const result = await UserController.updateProfile(req, userId, profileData);
    return res.status(result.message.includes("Tạo hồ sơ") ? 201 : 200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /users/${req.params.userId}/profile: ${error.message}`);
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

// Get User Learning Progress route
router.get("/:userId/learning-progress", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    const result = await UserController.getLearningProgress(req, userId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /users/${req.params.userId}/learning-progress: ${error.message}`);
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

// Get User Payment History route
router.get("/:userId/payment-history", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    const result = await UserController.getPaymentHistory(req, userId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /users/${req.params.userId}/payment-history: ${error.message}`);
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

// Get User Active Services route
router.get("/:userId/active-services", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    const result = await UserController.getActiveServices(req, userId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /users/${req.params.userId}/active-services: ${error.message}`);
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

// Search Users route (admin only)
router.get("/search/:searchTerm", authenticateToken, async (req, res) => {
  try {
    const { searchTerm } = req.params;
    if (!searchTerm || searchTerm.trim() === "" || searchTerm.length > 100) {
      return res.status(400).json({ status: "error", message: "Từ khóa tìm kiếm không hợp lệ (1-100 ký tự)" });
    }
    const result = await UserController.search(req, searchTerm);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /users/search/${req.params.searchTerm}: ${error.message}`);
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

// Upload User Avatar route (base64)
router.put("/:userId/avatar", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { url, public_id } = req.body;

    console.log(`[${new Date().toISOString()}] Avatar upload request:`, {
      userId,
      urlLength: url?.length,
      hasPublicId: !!public_id
    });

    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    if (!url || typeof url !== "string") {
      return res.status(400).json({ status: "error", message: "URL ảnh không hợp lệ" });
    }

    // Kiểm tra độ dài của base64 URL
    if (url.length > 1000000) { // 1MB limit
      return res.status(400).json({ status: "error", message: "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn" });
    }

    const fileData = { url, public_id };
    const result = await UserController.uploadAvatar(req, userId, fileData);

    console.log(`[${new Date().toISOString()}] Avatar upload success for user ${userId}`);

    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /users/${req.params.userId}/avatar: ${error.message}`);
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

// Upload User Avatar route (FormData)
router.put("/:userId/avatar-upload", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`[${new Date().toISOString()}] Avatar FormData upload request for user ${userId}`);

    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }

    // Kiểm tra file upload
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ status: "error", message: "Không tìm thấy file ảnh" });
    }

    const avatarFile = req.files.avatar;

    // Kiểm tra kích thước file (5MB limit)
    if (avatarFile.size > 5 * 1024 * 1024) {
      return res.status(400).json({ status: "error", message: "File quá lớn. Vui lòng chọn file nhỏ hơn 5MB" });
    }

    // Kiểm tra loại file
    if (!avatarFile.mimetype.startsWith('image/')) {
      return res.status(400).json({ status: "error", message: "Chỉ chấp nhận file hình ảnh" });
    }

    // Chuyển đổi file thành base64
    const base64Data = avatarFile.data.toString('base64');
    const mimeType = avatarFile.mimetype;
    const url = `data:${mimeType};base64,${base64Data}`;

    const fileData = { url, public_id: null };
    const result = await UserController.uploadAvatar(req, userId, fileData);

    console.log(`[${new Date().toISOString()}] Avatar FormData upload success for user ${userId}`);

    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /users/${req.params.userId}/avatar-upload: ${error.message}`);
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

// Lock User Account route (admin only)
router.post("/:userId/lock", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    const result = await UserController.lockUser(req, userId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /users/${req.params.userId}/lock: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy") || error.message.includes("đã bị khóa")
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

// Unlock User Account route (admin only)
router.post("/:userId/unlock", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (isNaN(userId)) {
      return res.status(400).json({ status: "error", message: "ID người dùng không hợp lệ" });
    }
    const result = await UserController.unlockUser(req, userId);
    return res.status(200).json({
      status: result.status,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /users/${req.params.userId}/unlock: ${error.message}`);
    const statusCode =
      error.message.includes("không hợp lệ") || error.message.includes("Không tìm thấy") || error.message.includes("chưa bị khóa")
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