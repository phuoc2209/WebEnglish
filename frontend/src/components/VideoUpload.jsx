import React, { useState, useRef } from 'react';
import { Upload, Play, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import uploadService from '../services/upload.service';
import { updateSkillVideo } from '../models/skill.model';

const VideoUpload = ({ skillId, onVideoUpload, currentVideo }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(currentVideo || '');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (!file) return;

        // Kiểm tra loại file
        if (!file.type.startsWith('video/')) {
            setError('Vui lòng chọn file video hợp lệ (MP4, AVI, MOV, etc.)');
            return;
        }

        // Kiểm tra kích thước file (giới hạn 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            setError('File video không được vượt quá 100MB');
            return;
        }

        setSelectedFile(file);
        setError('');

        // Tạo preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Vui lòng chọn file video trước khi upload');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            // Upload video lên Cloudinary
            const uploadResult = await uploadService.uploadVideo(selectedFile);

            if (uploadResult.success) {
                const videoData = {
                    video_url: uploadResult.data.url,
                    video_public_id: uploadResult.data.public_id
                };

                // Nếu có skillId, cập nhật vào database
                if (skillId) {
                    await updateSkillVideo(skillId, videoData);
                }

                setSuccess('Upload video thành công!');
                setSelectedFile(null);

                // Gọi callback function
                if (onVideoUpload) {
                    onVideoUpload(uploadResult.data.url);
                }

                // Reset preview
                if (previewUrl && previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(uploadResult.data.url);
            } else {
                throw new Error(uploadResult.message || 'Upload thất bại');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Lỗi khi upload video');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveVideo = () => {
        if (selectedFile) {
            setSelectedFile(null);
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(currentVideo || '');
        } else if (currentVideo) {
            // Xóa video hiện tại
            setPreviewUrl('');
            if (onVideoUpload) {
                onVideoUpload('');
            }
        }
        setError('');
        setSuccess('');
    };

    const handleClickUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            {/* Error/Success Messages */}
            {error && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {success && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm">{success}</span>
                </div>
            )}

            {/* Video Preview */}
            {previewUrl && (
                <div className="relative">
                    <video
                        className="w-full h-64 bg-black rounded-lg object-cover"
                        src={previewUrl}
                        controls
                        preload="metadata"
                    >
                        Trình duyệt của bạn không hỗ trợ video.
                    </video>
                    <button
                        onClick={handleRemoveVideo}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        title="Xóa video"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Upload Area */}
            {!previewUrl && (
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer ${isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={handleClickUpload}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleInputChange}
                        className="hidden"
                    />
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isDragging ? 'Thả video vào đây' : 'Upload Video'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Kéo thả video hoặc click để chọn file
                    </p>
                    <div className="text-sm text-gray-500">
                        <p>Hỗ trợ: MP4, AVI, MOV, WMV</p>
                        <p>Kích thước tối đa: 100MB</p>
                    </div>
                </div>
            )}

            {/* Upload Button */}
            {selectedFile && !uploading && (
                <div className="flex space-x-3">
                    <button
                        onClick={handleUpload}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Video
                    </button>
                    <button
                        onClick={handleRemoveVideo}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Hủy
                    </button>
                </div>
            )}

            {/* Loading State */}
            {uploading && (
                <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                    <span className="text-blue-600">Đang upload video...</span>
                </div>
            )}

            {/* File Info */}
            {selectedFile && (
                <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Play className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-700">{selectedFile.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoUpload; 