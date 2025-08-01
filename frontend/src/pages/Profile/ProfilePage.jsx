import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit,
    User,
    Mail,
    Calendar,
    Phone,
    BookOpen,
    CreditCard,
    Settings,
    Camera,
    Activity,
    BarChart3
} from 'lucide-react';
import { getUserById, getLearningProgress, getPaymentHistory, getActiveServices } from '../../models/user.model';
import { useUserStore } from '../../store/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useUserStore();
    const [user, setUser] = useState(null);
    const [learningProgress, setLearningProgress] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [activeServices, setActiveServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (currentUser?.user_id) {
            loadUserData();
        }
    }, [currentUser]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load user profile
            const userResponse = await getUserById(currentUser.user_id);
            if (userResponse.status === 'success') {
                setUser(userResponse.data);
            }

            // Load learning progress
            const progressResponse = await getLearningProgress(currentUser.user_id);
            if (progressResponse.status === 'success') {
                setLearningProgress(progressResponse.data);
            }

            // Load payment history
            const paymentResponse = await getPaymentHistory(currentUser.user_id);
            if (paymentResponse.status === 'success') {
                setPaymentHistory(paymentResponse.data);
            }

            // Load active services
            const servicesResponse = await getActiveServices(currentUser.user_id);
            if (servicesResponse.status === 'success') {
                setActiveServices(servicesResponse.data);
            }

        } catch (err) {
            setError(err.message || 'Lỗi kết nối đến máy chủ');
            toast.error(err.message || 'Lỗi kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'not_started':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // --- Thống kê học tập mới ---
    // Lấy tất cả bài học và bài kiểm tra (quiz/test)
    const getAllLessonsAndQuizzes = () => {
        if (!Array.isArray(learningProgress)) return [];
        // Bao gồm tất cả các lesson_type hợp lệ
        const validTypes = ['vocabulary', 'grammar', 'speaking', 'listening', 'reading', 'writing', 'quiz'];
        return learningProgress.filter(progress => validTypes.includes(progress.lesson_type));
    };

    // Tổng số bài học + bài kiểm tra
    const getTotalLessonsAndQuizzes = () => {
        return getAllLessonsAndQuizzes().length;
    };

    // Số bài đã hoàn thành
    const getTotalCompleted = () => {
        return getAllLessonsAndQuizzes().filter(progress => progress.status === 'completed').length;
    };

    // Điểm trung bình các bài kiểm tra (nếu có trường score)
    const getAverageScore = () => {
        const quizzes = getAllLessonsAndQuizzes().filter(progress => typeof progress.score === 'number' && !isNaN(progress.score));
        if (!quizzes.length) return 0;
        const totalScore = quizzes.reduce((sum, progress) => sum + progress.score, 0);
        return Math.round(totalScore / quizzes.length);
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

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Hồ Sơ Cá Nhân</h1>
                        <button
                            onClick={() => navigate('/profile/edit')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Chỉnh sửa
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                            {/* Profile Info */}
                            <div className="text-center mb-6">
                                <div className="relative inline-block mb-4">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                                        {user?.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt="Avatar"
                                                className="w-24 h-24 rounded-full object-cover"
                                            />
                                        ) : (
                                            user?.full_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                                        <Camera className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">{user?.full_name || user?.username}</h2>
                                <p className="text-gray-500">{user?.email}</p>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview'
                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5" />
                                        <span>Tổng quan</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('payments')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'payments'
                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-5 h-5" />
                                        <span>Thanh toán</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('services')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'services'
                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Settings className="w-5 h-5" />
                                        <span>Dịch vụ</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Personal Info */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-500" />
                                        Thông tin cá nhân
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium">{user?.email}</p>
                                            </div>
                                        </div>
                                        {user?.phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Số điện thoại</p>
                                                    <p className="font-medium">{user.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {user?.birthdate && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Ngày sinh</p>
                                                    <p className="font-medium">{formatDate(user.birthdate)}</p>
                                                </div>
                                            </div>
                                        )}
                                        {user?.gender && (
                                            <div className="flex items-center gap-3">
                                                <User className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Giới tính</p>
                                                    <p className="font-medium">{user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Learning Stats */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-green-500" />
                                        Thống kê học tập
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-3xl font-bold text-blue-600">{getTotalLessonsAndQuizzes()}</div>
                                            <div className="text-sm text-gray-600">Tổng bài học & kiểm tra</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <div className="text-3xl font-bold text-green-600">{getTotalCompleted()}</div>
                                            <div className="text-sm text-gray-600">Đã hoàn thành</div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="text-3xl font-bold text-purple-600">{getAverageScore()}%</div>
                                            <div className="text-sm text-gray-600">Điểm trung bình</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-orange-500" />
                                        Hoạt động gần đây
                                    </h3>
                                    {Array.isArray(learningProgress) && learningProgress.slice(0, 5).map((progress, index) => (
                                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <BookOpen className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{progress.lesson?.title || `Bài học ${progress.lesson_id}`}</p>
                                                    <p className="text-sm text-gray-500">{progress.lesson_type}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{progress.progress_percent}%</p>
                                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(progress.status)}`}>
                                                    {progress.status === 'completed' ? 'Hoàn thành' :
                                                        progress.status === 'in_progress' ? 'Đang học' : 'Chưa bắt đầu'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {!Array.isArray(learningProgress) && (
                                        <div className="text-center py-4 text-gray-500">
                                            Không có dữ liệu hoạt động
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Payments Tab */}
                        {activeTab === 'payments' && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-green-500" />
                                    Lịch sử thanh toán
                                </h3>
                                {!Array.isArray(paymentHistory) || paymentHistory.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Chưa có lịch sử thanh toán nào</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {paymentHistory.map((payment, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">
                                                            {payment.package?.name || `Gói ${payment.package_id}`}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">ID: {payment.payment_id}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(payment.status)}`}>
                                                        {payment.status === 'completed' ? 'Thành công' :
                                                            payment.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Số tiền:</span>
                                                        <span className="font-medium ml-2">{formatCurrency(payment.amount)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Ngày thanh toán:</span>
                                                        <span className="font-medium ml-2">{formatDate(payment.paid_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Services Tab */}
                        {activeTab === 'services' && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-purple-500" />
                                    Gói dịch vụ đang hoạt động
                                </h3>
                                {!Array.isArray(activeServices) || activeServices.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Chưa có gói dịch vụ nào đang hoạt động</p>
                                        <button
                                            onClick={() => navigate('/services')}
                                            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                        >
                                            Xem gói dịch vụ
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activeServices.map((service, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">
                                                            {service.package?.name || `Gói ${service.package_id}`}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">{service.package?.description}</p>
                                                    </div>
                                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                                        Đang hoạt động
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Ngày bắt đầu:</span>
                                                        <span className="font-medium ml-2">{formatDate(service.start_date)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Ngày kết thúc:</span>
                                                        <span className="font-medium ml-2">{formatDate(service.end_date)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProfilePage; 