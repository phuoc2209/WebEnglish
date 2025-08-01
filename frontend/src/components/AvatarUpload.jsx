import React, { useState, useRef } from 'react';
import UploadService from '../services/upload.service';
import { useUserStore } from '../store/userSlice';
import { User } from 'lucide-react';

const AvatarUpload = ({ onAvatarUpdate, currentAvatar }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(currentAvatar || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef();
    const { user } = useUserStore();

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        setError('');
        setSuccess('');

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Chỉ chấp nhận file ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Kích thước file không được vượt quá 5MB');
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile || !user) {
            setError('Vui lòng chọn file ảnh');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const uploadResult = await UploadService.uploadImage(selectedFile);

            if (uploadResult.status === 'success') {
                const updateResult = await UploadService.updateUserAvatar(user.user_id, uploadResult);

                if (updateResult.status === 'success') {
                    setSuccess('Cập nhật ảnh đại diện thành công!');
                    setSelectedFile(null);
                    setPreview(uploadResult.data.url);

                    if (onAvatarUpdate) {
                        onAvatarUpdate(uploadResult.data.url);
                    }
                } else {
                    setError('Có lỗi xảy ra khi cập nhật ảnh đại diện');
                }
            } else {
                setError(uploadResult.message || 'Upload thất bại');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Có lỗi xảy ra khi upload file. Vui lòng thử lại.');
        } finally {
            setUploading(false);
        }
    };

    // Hàm lấy chữ cái đầu tiên để làm fallback
    const getAvatarInitial = () => {
        if (user?.full_name) {
            return user.full_name.charAt(0).toUpperCase();
        }
        if (user?.username) {
            return user.username.charAt(0).toUpperCase();
        }
        if (user?.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return 'U';
    };

    // Hàm render avatar preview
    const renderAvatarPreview = () => {
        // Chỉ render img nếu có preview hợp lệ
        if (preview && preview.trim() !== "" && preview !== null && preview !== undefined) {
            return (
                <img
                    src={preview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to initial if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            );
        }

        // Fallback to initial avatar
        return (
            <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-2xl">
                {getAvatarInitial()}
            </div>
        );
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Cập nhật ảnh đại diện</h3>

            <div className="mb-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200 relative">
                    {renderAvatarPreview()}
                    {/* Fallback avatar (hidden by default) */}
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-2xl hidden">
                        {getAvatarInitial()}
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            {selectedFile && (
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {uploading ? 'Đang upload...' : 'Cập nhật'}
                </button>
            )}
        </div>
    );
};

export default AvatarUpload; 