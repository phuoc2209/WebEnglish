const express = require('express');
const router = express.Router();
const uploadController = require('../controller/uploadController');
const { uploadAvatar, uploadAudio, uploadVideo, uploadMultiple } = require('../middlewares/uploadMiddleware');
const { authenticateUser } = require('../middlewares/authMiddleware');

// Tạo thư mục uploads nếu chưa tồn tại
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes cho upload
// Upload avatar (yêu cầu đăng nhập)
router.post('/avatar', authenticateUser, uploadAvatar, uploadController.uploadAvatar);

// Upload audio cho speaking (yêu cầu đăng nhập)
router.post('/audio', authenticateUser, uploadAudio, uploadController.uploadAudio);

// Upload video cho listening (yêu cầu đăng nhập)
router.post('/video', authenticateUser, uploadVideo, uploadController.uploadVideo);

// Upload nhiều file (yêu cầu đăng nhập)
router.post('/multiple', authenticateUser, uploadMultiple, uploadController.uploadMultiple);

// Xóa file từ Cloudinary (yêu cầu đăng nhập)
router.delete('/delete', authenticateUser, uploadController.deleteFile);

module.exports = router; 