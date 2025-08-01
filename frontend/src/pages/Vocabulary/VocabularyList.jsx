import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Clock, Star, Users, ChevronRight, Search, Filter, BookOpen, Pen, Award, RotateCcw } from 'lucide-react';
import { getAllLessons, getLessonProgressAndAnswers } from '../../models/lesson.model';
import { useCheckAuth } from '../../hooks/useCheckAuth';
import { useUserStore } from '../../store/userSlice';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

const VocabularyList = () => {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ limit: 12, offset: 0, total: 0 });

    useCheckAuth();

    // Lấy danh sách bài học từ vựng
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
                const response = await getAllLessons('vocabulary', pagination.limit, pagination.offset);
                console.log('Vocabulary lessons response:', response);
                if (response.status === 'success') {
                    // Hỗ trợ cả trường hợp response.data là mảng hoặc object có rows
                    const vocabularyLessons = Array.isArray(response.data) ? response.data : (response.data.rows || []);

                    // Lấy thông tin tiến độ cho từng bài học
                    const lessonsWithProgress = await Promise.all(
                        vocabularyLessons.map(async (lesson) => {
                            try {
                                const progressResponse = await getLessonProgressAndAnswers(lesson.lesson_id, 'vocabulary');
                                let progressData = null;
                                let completedQuestions = 0;
                                let totalQuestions = lesson.exercise_count || 5;
                                let status = 'not_started';
                                let progressPercent = 0;

                                if (progressResponse.status === 'success') {
                                    progressData = progressResponse.data;
                                    status = progressData.progress?.status || 'not_started';

                                    // Lấy số câu hỏi thực tế từ bài học
                                    if (progressData.lesson && progressData.lesson.exercises) {
                                        totalQuestions = progressData.lesson.exercises.length;
                                    } else {
                                        totalQuestions = lesson.exercise_count || 5;
                                    }

                                    // Tính số câu đã hoàn thành dựa trên submissions mới nhất
                                    if (progressData.submissions && progressData.submissions.length > 0) {
                                        // Lấy câu trả lời mới nhất cho mỗi câu hỏi
                                        const latestSubmissions = [];
                                        progressData.lesson?.exercises?.forEach(exercise => {
                                            const exerciseSubmissions = progressData.submissions.filter(s => s.exercise_id === exercise.exercise_id);
                                            if (exerciseSubmissions.length > 0) {
                                                // Lấy submission mới nhất
                                                const latestSubmission = exerciseSubmissions[exerciseSubmissions.length - 1];
                                                latestSubmissions.push(latestSubmission);
                                            }
                                        });
                                        completedQuestions = latestSubmissions.length;
                                    }

                                    // Tính phần trăm tiến độ dựa trên số câu hỏi đã hoàn thành
                                    progressPercent = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;
                                }

                                return {
                                    lesson_id: lesson.lesson_id,
                                    lesson_type: 'vocabulary',
                                    title: lesson.title,
                                    description: lesson.description || 'Bài học từ vựng',
                                    content: lesson.content,
                                    content_preview: lesson.usage?.substring(0, 150) + '...' || 'Không có mô tả',
                                    level: lesson.level || 'beginner',
                                    duration: '15-20 phút',
                                    total_questions: totalQuestions,
                                    completed_questions: completedQuestions,
                                    rating: 4.5,
                                    students: Math.floor(Math.random() * 500) + 100,
                                    category: lesson.category || 'General',
                                    difficulty: lesson.difficulty || 'Easy',
                                    progress_data: progressData,
                                    status: status,
                                    progress_percent: progressPercent
                                };
                            } catch (progressError) {
                                console.error(`Error fetching progress for lesson ${lesson.lesson_id}:`, progressError);
                                // Trả về bài học với trạng thái mặc định nếu không lấy được tiến độ
                                return {
                        lesson_id: lesson.lesson_id,
                        lesson_type: 'vocabulary',
                        title: lesson.title,
                        description: lesson.description || 'Bài học từ vựng',
                        content: lesson.content,
                        content_preview: lesson.usage?.substring(0, 150) + '...' || 'Không có mô tả',
                        level: lesson.level || 'beginner',
                        duration: '15-20 phút',
                                    total_questions: lesson.exercise_count || 5,
                                    completed_questions: 0,
                        rating: 4.5,
                        students: Math.floor(Math.random() * 500) + 100,
                        category: lesson.category || 'General',
                                    difficulty: lesson.difficulty || 'Easy',
                                    progress_data: null,
                                    status: 'not_started',
                                    progress_percent: 0
                                };
                            }
                        })
                    );

                    setLessons(lessonsWithProgress);
                    setPagination(prev => ({ ...prev, total: (Array.isArray(response.data) ? response.data.length : response.data.count) || vocabularyLessons.length }));
                } else {
                    throw new Error(response.message);
                }
            } catch (err) {
                console.error('Fetch vocabulary lessons error:', err.message);
                let errorMessage = err.message || 'Lỗi khi tải bài học từ vựng';
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

    const filteredLessons = lessons.filter(lesson => {
        const matchesLevel = selectedLevel === 'all' || lesson.level === selectedLevel;
        const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lesson.category && lesson.category.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesLevel && matchesSearch;
    });

    const getLevelColor = (level) => {
        switch (level) {
            case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getLevelText = (level) => {
        switch (level) {
            case 'beginner': return 'beginner';
            case 'intermediate': return 'intermediate';
            case 'advanced': return 'advanced';
            default: return 'beginner';
        }
    };

    const getProgressWidth = (completed, total) => {
        return total > 0 ? (completed / total) * 100 : 0;
    };

    const getButtonInfo = (lesson) => {
        const { status, completed_questions, total_questions } = lesson;

        // Tính phần trăm tiến độ dựa trên số câu hỏi
        const progressPercent = total_questions > 0 ? (completed_questions / total_questions) * 100 : 0;

        // Kiểm tra đã hoàn thành hết câu hỏi chưa
        const isCompleted = completed_questions >= total_questions && total_questions > 0;

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
        } else if (completed_questions > 0) {
            return {
                primaryText: `Tiếp tục (${completed_questions}/${total_questions})`,
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
            navigate(`/vocabulary/${lesson.lesson_id}?mode=review`);
        } else if (action === 'retry') {
            // Làm lại bài học
            navigate(`/vocabulary/${lesson.lesson_id}?mode=retry`);
        } else {
            // Vào bài học bình thường (start hoặc continue)
        navigate(`/vocabulary/${lesson.lesson_id}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
            <Navbar />

            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white/20 p-4 rounded-full">
                                <Book className="w-12 h-12" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Vocabulary Lessons</h1>
                        <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                            Mở rộng vốn từ vựng tiếng Anh với các bài học từ vựng đa dạng, ví dụ thực tế và bài tập tương tác.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center">
                            <Book className="w-8 h-8 text-purple-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Total Lessons</p>
                                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center">
                            <Clock className="w-8 h-8 text-green-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Study Time</p>
                                <p className="text-2xl font-bold text-gray-900">15-20 phút</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center">
                            <Star className="w-8 h-8 text-yellow-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Average Rating</p>
                                <p className="text-2xl font-bold text-gray-900">4.5</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-blue-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Active Students</p>
                                <p className="text-2xl font-bold text-gray-900">1.8k</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                    placeholder="Search vocabulary lessons..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <Filter className="w-5 h-5 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-600">Level:</span>
                            </div>
                            <div className="flex space-x-2">
                                {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setSelectedLevel(level)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedLevel === level
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lessons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLessons.map((lesson) => {
                        const buttonInfo = getButtonInfo(lesson);
                        const progressWidth = getProgressWidth(lesson.completed_questions, lesson.total_questions);

                        return (
                            <div key={lesson.lesson_id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(lesson.level)}`}>
                                                    {getLevelText(lesson.level)}
                                                </span>
                                        <div className="flex items-center text-yellow-500">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="ml-1 text-sm font-medium">{lesson.rating}</span>
                                        </div>
                                    </div>

                                    {/* Title and Category */}
                                    <h3 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">
                                        {lesson.title}
                                    </h3>
                                    <p className="text-sm text-purple-600 font-medium mb-3">{lesson.category}</p>

                                    {/* Description */}
                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                        {lesson.description}
                                    </p>

                                    {/* Stats */}
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

                                    {/* Progress */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Progress</span>
                                            <span>{lesson.completed_questions}/{lesson.total_questions} questions</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${progressWidth}%` }}
                                            ></div>
                                        </div>
                                        {/* Status indicator */}
                                        <div className="mt-2 text-xs">
                                            {lesson.completed_questions >= lesson.total_questions && lesson.total_questions > 0 && (
                                                <span className="text-green-600 font-medium">✓ Hoàn thành</span>
                                            )}
                                            {lesson.completed_questions > 0 && lesson.completed_questions < lesson.total_questions && (
                                                <span className="text-blue-600 font-medium">⟳ Đang học</span>
                                            )}
                                            {lesson.completed_questions === 0 && (
                                                <span className="text-gray-500">○ Chưa bắt đầu</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        {buttonInfo.showTwoButtons ? (
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
                                        ) : (
                                    <button
                                                onClick={() => handleLessonAction(lesson, buttonInfo.primaryAction)}
                                                className={`flex-1 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center ${buttonInfo.primaryClassName}`}
                                    >
                                                {buttonInfo.primaryIcon}
                                                {buttonInfo.primaryText}
                                    </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredLessons.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                    </div>
                )}

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

export default VocabularyList; 