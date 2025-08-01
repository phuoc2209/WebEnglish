const express = require('express');
const multer = require('multer');
const { gradeSpeaking, gradeWriting } = require('../controller/aiGradingController');
const path = require('path');
const router = express.Router();

// Multer configuration for audio files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Giữ nguyên tên file gốc nếu có extension hợp lệ
        const originalName = file.originalname;
        const extension = path.extname(originalName).toLowerCase();
        const supportedExtensions = ['.wav', '.webm', '.mp3', '.m4a', '.mp4', '.mpeg', '.mpga', '.oga', '.ogg'];

        if (supportedExtensions.includes(extension)) {
            // Giữ nguyên tên file gốc
            cb(null, originalName);
        } else {
            // Tạo tên file mới với extension dựa trên MIME type
            const mimeToExt = {
                'audio/wav': '.wav',
                'audio/webm': '.webm',
                'audio/mp3': '.mp3',
                'audio/mp4': '.mp4',
                'audio/mpeg': '.mp3',
                'audio/ogg': '.ogg'
            };
            const ext = mimeToExt[file.mimetype] || '.wav';
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `audio-${uniqueSuffix}${ext}`);
        }
    }
});

const fileFilter = (req, file, cb) => {
    // Kiểm tra định dạng file audio
    const allowedMimes = ['audio/wav', 'audio/webm', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/ogg'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file format: ${file.mimetype}. Supported formats: ${allowedMimes.join(', ')}`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Chấm điểm speaking (audio)
router.post('/speaking/grade', upload.single('audio'), (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
}, gradeSpeaking);

// Chấm điểm writing (text)
router.post('/writing/grade', gradeWriting);

module.exports = router; 