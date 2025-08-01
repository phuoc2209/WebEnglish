const multer = require('multer');
const path = require('path');

// Cấu hình storage cho multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter để kiểm tra loại file
const fileFilter = (req, file, cb) => {
    // Cho phép các loại file
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'];
    const allowedAudioTypes = [
        'audio/mp3',
        'audio/mpeg',
        'audio/mp4',
        'audio/wav',
        'audio/wave',
        'audio/m4a',
        'audio/aac',
        'audio/ogg',
        'audio/webm'
    ];

    // Kiểm tra MIME type
    if (allowedImageTypes.includes(file.mimetype) ||
        allowedVideoTypes.includes(file.mimetype) ||
        allowedAudioTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Kiểm tra thêm bằng extension nếu MIME type không khớp
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm'];

        if (allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            console.log('Rejected file:', {
                originalname: file.originalname,
                mimetype: file.mimetype,
                extension: fileExtension
            });
            cb(new Error('Loại file không được hỗ trợ!'), false);
        }
    }
};

// Cấu hình upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // Giới hạn 50MB
    }
});

// Middleware cho upload avatar
const uploadAvatar = upload.single('avatar');

// Middleware cho upload audio (speaking)
const uploadAudio = upload.single('audio');

// Middleware cho upload video (listening)
const uploadVideo = upload.single('video');

// Middleware cho upload nhiều file
const uploadMultiple = upload.array('files', 10);

module.exports = {
    uploadAvatar,
    uploadAudio,
    uploadVideo,
    uploadMultiple,
    upload
}; 