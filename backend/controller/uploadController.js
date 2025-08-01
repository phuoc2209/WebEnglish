const cloudinary = require('../config/cloudinaryConfig');
const fs = require('fs');
const path = require('path');

class UploadController {
    // Upload avatar
    async uploadAvatar(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có file nào được upload'
                });
            }

            // Upload lên Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'avatars',
                transformation: [
                    { width: 300, height: 300, crop: 'fill' },
                    { quality: 'auto' }
                ]
            });

            // Xóa file tạm
            fs.unlinkSync(req.file.path);

            res.json({
                success: true,
                message: 'Upload avatar thành công',
                data: {
                    url: result.secure_url,
                    public_id: result.public_id,
                    format: result.format,
                    size: result.bytes
                }
            });
        } catch (error) {
            console.error('Upload avatar error:', error);

            // Xóa file tạm nếu có lỗi
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi khi upload avatar',
                error: error.message
            });
        }
    }

    // Upload audio cho speaking
    async uploadAudio(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có file audio nào được upload'
                });
            }

            // Upload lên Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'speaking-audio',
                resource_type: 'video', // Cloudinary xử lý audio như video
                transformation: [
                    { quality: 'auto' }
                ]
            });

            // Xóa file tạm
            fs.unlinkSync(req.file.path);

            res.json({
                success: true,
                message: 'Upload audio thành công',
                data: {
                    url: result.secure_url,
                    public_id: result.public_id,
                    format: result.format,
                    duration: result.duration,
                    size: result.bytes
                }
            });
        } catch (error) {
            console.error('Upload audio error:', error);

            // Xóa file tạm nếu có lỗi
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi khi upload audio',
                error: error.message
            });
        }
    }

    // Upload video cho listening
    async uploadVideo(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có file video nào được upload'
                });
            }

            // Upload lên Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'listening-videos',
                resource_type: 'video',
                transformation: [
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            });

            // Xóa file tạm
            fs.unlinkSync(req.file.path);

            res.json({
                success: true,
                message: 'Upload video thành công',
                data: {
                    url: result.secure_url,
                    public_id: result.public_id,
                    format: result.format,
                    duration: result.duration,
                    size: result.bytes,
                    width: result.width,
                    height: result.height
                }
            });
        } catch (error) {
            console.error('Upload video error:', error);

            // Xóa file tạm nếu có lỗi
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi khi upload video',
                error: error.message
            });
        }
    }

    // Upload nhiều file
    async uploadMultiple(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có file nào được upload'
                });
            }

            const uploadPromises = req.files.map(async (file) => {
                const folder = this.getFolderByFileType(file.mimetype);
                const resourceType = this.getResourceTypeByFileType(file.mimetype);

                const result = await cloudinary.uploader.upload(file.path, {
                    folder: folder,
                    resource_type: resourceType,
                    transformation: [
                        { quality: 'auto' }
                    ]
                });

                // Xóa file tạm
                fs.unlinkSync(file.path);

                return {
                    originalName: file.originalname,
                    url: result.secure_url,
                    public_id: result.public_id,
                    format: result.format,
                    size: result.bytes,
                    duration: result.duration || null,
                    width: result.width || null,
                    height: result.height || null
                };
            });

            const results = await Promise.all(uploadPromises);

            res.json({
                success: true,
                message: 'Upload nhiều file thành công',
                data: results
            });
        } catch (error) {
            console.error('Upload multiple files error:', error);

            // Xóa tất cả file tạm nếu có lỗi
            if (req.files) {
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi khi upload nhiều file',
                error: error.message
            });
        }
    }

    // Xóa file từ Cloudinary
    async deleteFile(req, res) {
        try {
            const { public_id, resource_type = 'image' } = req.body;

            if (!public_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Public ID là bắt buộc'
                });
            }

            const result = await cloudinary.uploader.destroy(public_id, {
                resource_type: resource_type
            });

            res.json({
                success: true,
                message: 'Xóa file thành công',
                data: result
            });
        } catch (error) {
            console.error('Delete file error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa file',
                error: error.message
            });
        }
    }

    // Helper methods
    getFolderByFileType(mimetype) {
        if (mimetype.startsWith('image/')) return 'images';
        if (mimetype.startsWith('video/')) return 'videos';
        if (mimetype.startsWith('audio/')) return 'audio';
        return 'others';
    }

    getResourceTypeByFileType(mimetype) {
        if (mimetype.startsWith('image/')) return 'image';
        if (mimetype.startsWith('video/') || mimetype.startsWith('audio/')) return 'video';
        return 'auto';
    }
}

module.exports = new UploadController(); 