import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, Clock, Star, Users, ChevronRight, Pen, Award, RotateCcw } from 'lucide-react';
import { getSkillLessonsByType, getLessonProgressAndAnswers } from '../../models/skill.model';
import { useCheckAuth } from '../../hooks/useCheckAuth';
import { useUserStore } from '../../store/userSlice';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

const Listening = () => {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ limit: 10, offset: 0, total: 0 });

    useCheckAuth();

    useEffect(() => {
        const fetchLessons = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!user?.user_id) throw new Error('Vui lòng đăng nhập để xem bài học');
                const token = localStorage.getItem('token');
                if (!token) {
                    localStorage.removeItem('token');
                    throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
                }
                const response = await getSkillLessonsByType('listening', pagination.limit, pagination.offset);
                console.log('Lessons response:', response);
                if (response.status === 'success') {
                    const listeningLessons = response.data || [];

                    // Lấy thông tin tiến độ cho từng bài học
                    const lessonsWithProgress = await Promise.all(
                        listeningLessons.map(async (lesson) => {
                            try {
                                const progressResponse = await getLessonProgressAndAnswers(lesson.skill_id, 'listening');
                                let progressData = null;
                                let completedExercises = 0;
                                let totalExercises = lesson.exercises?.length || 10;
                                let status = 'not_started';
                                let progressPercent = 0;

                                if (progressResponse.status === 'success') {
                                    progressData = progressResponse.data;
                                    status = progressData.progress?.status || 'not_started';

                                    // Lấy số câu hỏi thực tế từ bài học
                                    if (progressData.lesson && progressData.lesson.exercises) {
                                        totalExercises = progressData.lesson.exercises.length;
                                    } else {
                                        totalExercises = lesson.exercises?.length || 10;
                                    }

                                    // Tính số câu đã hoàn thành dựa trên submissions mới nhất
                                    if (progressData.submissions && progressData.submissions.length > 0) {
                                        // Với skill lessons, mỗi submission là một câu trả lời cho một câu hỏi
                                        // Lấy số submission duy nhất (mỗi câu hỏi chỉ tính 1 lần)
                                        const uniqueSubmissions = [];
                                        const seenQuestions = new Set();

                                        progressData.submissions.forEach(submission => {
                                            // Sử dụng question làm key để xác định câu hỏi duy nhất
                                            const questionKey = submission.question;
                                            if (!seenQuestions.has(questionKey)) {
                                                seenQuestions.add(questionKey);
                                                uniqueSubmissions.push(submission);
                                            }
                                        });

                                        completedExercises = uniqueSubmissions.length;
                                    }

                                    // Tính phần trăm tiến độ dựa trên số câu hỏi đã hoàn thành
                                    progressPercent = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
                                }

                                return {
                                    skill_id: lesson.skill_id,
                                    lesson_type: 'listening',
                                    title: lesson.title,
                                    description: lesson.description || 'No description',
                                    content: lesson.content,
                                    content_preview: lesson.content?.substring(0, 100) + '...' || 'No preview',
                                    level: lesson.level || 'beginner',
                                    duration: '20 minutes',
                                    total_exercises: totalExercises,
                                    completed_exercises: completedExercises,
                                    rating: 4.5,
                                    students: 1000,
                                    progress_data: progressData,
                                    status: status,
                                    progress_percent: progressPercent
                                };
                            } catch (progressError) {
                                console.error(`Error fetching progress for lesson ${lesson.skill_id}:`, progressError);
                                // Trả về bài học với trạng thái mặc định nếu không lấy được tiến độ
                                return {
                                    skill_id: lesson.skill_id,
                                    lesson_type: 'listening',
                                    title: lesson.title,
                                    description: lesson.description || 'No description',
                                    content: lesson.content,
                                    content_preview: lesson.content?.substring(0, 100) + '...' || 'No preview',
                                    level: lesson.level || 'beginner',
                                    duration: '20 minutes',
                                    total_exercises: lesson.exercises?.length || 10,
                                    completed_exercises: 0,
                                    rating: 4.5,
                                    students: 1000,
                                    progress_data: null,
                                    status: 'not_started',
                                    progress_percent: 0
                                };
                            }
                        })
                    );

                    setLessons(lessonsWithProgress);
                    setPagination(prev => ({ ...prev, total: response.pagination?.total || listeningLessons.length }));
                } else {
                    throw new Error(response.message);
                }
            } catch (err) {
                console.error('Fetch lessons error:', err.message);
                let errorMessage = err.message || 'Lỗi khi tải bài học';
                if (err.message.includes('Không có quyền')) {
                    errorMessage = 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
                    localStorage.removeItem('token');
                    navigate('/login');
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchLessons();
    }, [user?.user_id, pagination.offset, pagination.limit, navigate]);

    const handlePageChange = (newOffset) => {
        setPagination(prev => ({ ...prev, offset: newOffset }));
    };

    const filteredLessons = lessons.filter(lesson =>
        selectedLevel === 'all' || lesson.level === selectedLevel
    );

    const getLevelColor = (level) => {
        switch (level) {
            case 'beginner': return 'bg-green-100 text-green-800';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getProgressWidth = (completed, total) => {
        return total > 0 ? (completed / total) * 100 : 0;
    };

    const getButtonInfo = (lesson) => {
        const { status, completed_exercises, total_exercises } = lesson;

        // Tính phần trăm tiến độ dựa trên số câu hỏi
        const progressPercent = total_exercises > 0 ? (completed_exercises / total_exercises) * 100 : 0;

        // Kiểm tra đã hoàn thành hết câu hỏi chưa
        const isCompleted = completed_exercises >= total_exercises && total_exercises > 0;

        if (isCompleted) {
            return {
                primaryText: 'Xem lại',
                primaryIcon: <Award className="w-4 h-4 mr-1" />,
                primaryClassName: 'bg-purple-600 hover:bg-purple-700',
                primaryAction: 'review',
                secondaryText: 'Làm lại',
                secondaryIcon: <RotateCcw className="w-4 h-4 mr-1" />,
                secondaryClassName: 'bg-orange-600 hover:bg-orange-700',
                secondaryAction: 'retry',
                showTwoButtons: true
            };
        } else if (completed_exercises > 0) {
            return {
                primaryText: `Tiếp tục (${completed_exercises}/${total_exercises})`,
                primaryIcon: <Pen className="w-4 h-4 mr-1" />,
                primaryClassName: 'bg-green-600 hover:bg-green-700',
                primaryAction: 'continue',
                showTwoButtons: false
            };
        } else {
            return {
                primaryText: 'Bắt đầu',
                primaryIcon: <ChevronRight className="w-4 h-4 mr-1" />,
                primaryClassName: 'bg-blue-600 hover:bg-blue-700',
                primaryAction: 'start',
                showTwoButtons: false
            };
        }
    };

    const handleLessonAction = (lesson, action) => {
        if (action === 'review') {
            // Vào bài học với trạng thái review
            navigate(`/listening/${lesson.skill_id}?mode=review`);
        } else if (action === 'retry') {
            // Làm lại bài học
            navigate(`/listening/${lesson.skill_id}?mode=retry`);
        } else {
            // Vào bài học bình thường (start hoặc continue)
            navigate(`/listening/${lesson.skill_id}`);
        }
    };

    const handlePreviewClick = (lesson) => {
        alert(`Preview: ${lesson.content_preview}`);
    };

    const handleActionButton = (lesson) => {
        console.log('Navigating to lesson:', lesson.skill_id);
        navigate(`/listening/${lesson.skill_id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <Navbar />
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white/20 p-4 rounded-full">
                                <Headphones className="w-12 h-12" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Listening Skills</h1>
                        <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                            Cải thiện khả năng nghe hiểu tiếng Anh của bạn với các bài tập nghe và các đoạn hội thoại thực tế.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center">
                            <Headphones className="w-8 h-8 text-purple-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Tổng bài học</p>
                                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center">
                            <Clock className="w-8 h-8 text-blue-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Thời gian học</p>
                                <p className="text-2xl font-bold text-gray-900">20 phút</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center">
                            <Star className="w-8 h-8 text-yellow-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Đánh giá TB</p>
                                <p className="text-2xl font-bold text-gray-900">4.5</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-green-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Học viên</p>
                                <p className="text-2xl font-bold text-gray-900">1.2k</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Level Filter */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Filter by Level</h2>
                    <div className="flex flex-wrap gap-3">
                        {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                            <button
                                key={level}
                                onClick={() => setSelectedLevel(level)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedLevel === level
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lessons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLessons.map((lesson) => (
                        <div key={lesson.skill_id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(lesson.level)}`}>
                                        {lesson.level}
                                    </span>
                                    <div className="flex items-center text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="ml-1 text-sm font-medium">{lesson.rating}</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">
                                    {lesson.title}
                                </h3>

                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {lesson.content_preview}
                                </p>

                                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>{lesson.duration}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        <span>{lesson.students} students</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span>{lesson.completed_exercises}/{lesson.total_exercises} exercises</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${getProgressWidth(lesson.completed_exercises, lesson.total_exercises)}%` }}
                                        ></div>
                                    </div>
                                    {/* Status indicator */}
                                    <div className="mt-2 text-xs">
                                        {lesson.completed_exercises >= lesson.total_exercises && lesson.total_exercises > 0 && (
                                            <span className="text-green-600 font-medium">✓ Hoàn thành</span>
                                        )}
                                        {lesson.completed_exercises > 0 && lesson.completed_exercises < lesson.total_exercises && (
                                            <span className="text-blue-600 font-medium">⟳ Đang học</span>
                                        )}
                                        {lesson.completed_exercises === 0 && (
                                            <span className="text-gray-500">○ Chưa bắt đầu</span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {(() => {
                                        const buttonInfo = getButtonInfo(lesson);
                                        if (buttonInfo.showTwoButtons) {
                                            return (
                                                <>
                                                    <button
                                                        onClick={() => handleLessonAction(lesson, buttonInfo.primaryAction)}
                                                        className={`flex-1 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center ${buttonInfo.primaryClassName}`}
                                                    >
                                                        {buttonInfo.primaryIcon}
                                                        {buttonInfo.primaryText}
                                                    </button>
                                                    <button
                                                        onClick={() => handleLessonAction(lesson, buttonInfo.secondaryAction)}
                                                        className={`flex-1 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center ${buttonInfo.secondaryClassName}`}
                                                    >
                                                        {buttonInfo.secondaryIcon}
                                                        {buttonInfo.secondaryText}
                                                    </button>
                                                </>
                                            );
                                        } else {
                                            return (
                                                <button
                                                    onClick={() => handleLessonAction(lesson, buttonInfo.primaryAction)}
                                                    className={`flex-1 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center ${buttonInfo.primaryClassName}`}
                                                >
                                                    {buttonInfo.primaryIcon}
                                                    {buttonInfo.primaryText}
                                                </button>
                                            );
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {pagination.total > pagination.limit && (
                    <div className="flex justify-center mt-8">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                                disabled={pagination.offset === 0}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                                Page {Math.floor(pagination.offset / pagination.limit) + 1} of {Math.ceil(pagination.total / pagination.limit)}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                                disabled={pagination.offset + pagination.limit >= pagination.total}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Listening; 