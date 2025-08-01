import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Calendar,
    Camera,
    Upload,
    X
} from 'lucide-react';
import { getUserById, updateUser, updateProfile, uploadAvatarWithFormData } from '../../models/user.model';
import { useUserStore } from '../../store/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

const EditProfile = () => {
    const navigate = useNavigate();
    const { user: currentUser, updateUser } = useUserStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUserData] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
        gender: '',
        birthdate: '',
    });

    // Avatar upload
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    useEffect(() => {
        if (currentUser?.user_id) {
            loadUserData();
        }
    }, [currentUser]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getUserById(currentUser.user_id);
            if (response.status === 'success') {
                setUserData(response.data);
                setFormData({
                    username: response.data.username || '',
                    email: response.data.email || '',
                    full_name: response.data.full_name || '',
                    gender: response.data.gender || '',
                    birthdate: response.data.birthdate ? response.data.birthdate.split('T')[0] : '',
                });
            } else {
                setError(response.message || 'Không thể tải thông tin người dùng');
            }
        } catch (err) {
            setError(err.message || 'Lỗi kết nối đến máy chủ');
            toast.error(err.message || 'Lỗi kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Vui lòng chọn file hình ảnh');
                return;
            }

            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            // Update user basic info
            const userUpdateData = {};
            if (formData.username !== user?.username) userUpdateData.username = formData.username;
            if (formData.email !== user?.email) userUpdateData.email = formData.email;

            if (Object.keys(userUpdateData).length > 0) {
                await updateUser(currentUser.user_id, userUpdateData);
            }

            // Update profile info
            const profileUpdateData = {};
            if (formData.full_name !== user?.full_name) profileUpdateData.full_name = formData.full_name;
            if (formData.gender !== user?.gender) profileUpdateData.gender = formData.gender;
            if (formData.birthdate !== (user?.birthdate ? user.birthdate.split('T')[0] : '')) {
                profileUpdateData.birthdate = formData.birthdate;
            }

            if (Object.keys(profileUpdateData).length > 0) {
                await updateProfile(currentUser.user_id, profileUpdateData);
            }

            // Khởi tạo updatedUser TRƯỚC khi upload avatar
            const updatedUser = {
                ...currentUser,
                ...userUpdateData,
                ...profileUpdateData
            };

            // Upload avatar if changed
            if (avatarFile) {
                try {
                    console.log('Uploading avatar file...', { userId: currentUser.user_id, file: avatarFile });
                    const uploadRes = await uploadAvatarWithFormData(currentUser.user_id, avatarFile);
                    console.log('Avatar file uploaded successfully');
                    // Cập nhật avatar_url mới vào user state nếu có
                    if (uploadRes?.data?.avatar_url) {
                        updatedUser.avatar_url = uploadRes.data.avatar_url;
                    }
                } catch (avatarError) {
                    console.error('Avatar upload error:', avatarError);
                    toast.error(`Lỗi upload ảnh: ${avatarError.message}`);
                    // Continue with other updates even if avatar upload fails
                }
            }

            updateUser(updatedUser);

            toast.success('Cập nhật thông tin thành công!');
            navigate('/profile');

        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">👤</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={loadUserData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />
            <ToastContainer />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/profile')}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">Chỉnh Sửa Hồ Sơ</h1>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Avatar Section */}
                        <div className="text-center">
                            <div className="relative inline-block mb-4">
                                <img
                                    src={avatarPreview || user?.avatar_url || 'https://via.placeholder.com/120x120?text=Avatar'}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAvatarModal(true)}
                                    className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500">Click vào icon camera để thay đổi ảnh đại diện</p>
                        </div>

                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên đăng nhập
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Nhập tên đăng nhập"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Nhập email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Họ và tên
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Nhập họ và tên"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giới tính
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="male">Nam</option>
                                        <option value="female">Nữ</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngày sinh
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="date"
                                            name="birthdate"
                                            value={formData.birthdate}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <LoadingSpinner />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Avatar Upload Modal */}
            {showAvatarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Thay đổi ảnh đại diện</h3>
                            <button
                                onClick={() => setShowAvatarModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="text-center mb-4">
                            {avatarPreview && (
                                <img
                                    src={avatarPreview}
                                    alt="Preview"
                                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                                />
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="sr-only">Chọn ảnh</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                            </label>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAvatarModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => setShowAvatarModal(false)}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default EditProfile; 