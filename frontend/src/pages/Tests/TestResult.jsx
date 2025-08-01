import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    CheckCircle,
    XCircle,
    Trophy,
    Clock,
    BarChart3,
    ArrowLeft,
    RefreshCw,
    Target,
    TrendingUp,
    Award
} from 'lucide-react';
import { calculateTestScore, getAnswerSubmissions, getQuizById } from '../../models/test.model';
import { useUserStore } from '../../store/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

const TestResult = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUserStore();
    const [result, setResult] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                setLoading(true);

                // Lấy thông tin bài kiểm tra
                const quizResponse = await getQuizById(quizId);
                setQuiz(quizResponse.data);

                // Lấy kết quả điểm số từ location state hoặc tính toán
                if (location.state?.result) {
                    setResult(location.state.result);
                } else {
                    // Nếu không có trong state, tính toán lại
                    const scoreResponse = await calculateTestScore(location.state?.attemptId);
                    setResult(scoreResponse.data);
                }

                // Lấy chi tiết câu trả lời
                if (location.state?.attemptId) {
                    const submissionsResponse = await getAnswerSubmissions(location.state.attemptId);
                    setSubmissions(submissionsResponse.data);
                }

                setError(null);
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [quizId, location.state]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-blue-600';
        if (score >= 70) return 'text-yellow-600';
        if (score >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    const getScoreMessage = (score) => {
        if (score >= 90) return 'Xuất sắc! Bạn đã hoàn thành bài kiểm tra một cách tuyệt vời.';
        if (score >= 80) return 'Tốt! Bạn đã hiểu rõ nội dung bài học.';
        if (score >= 70) return 'Khá! Bạn cần ôn tập thêm một số phần.';
        if (score >= 60) return 'Trung bình! Bạn cần cải thiện nhiều hơn.';
        return 'Cần cải thiện! Hãy ôn tập lại kiến thức.';
    };

    const getScoreIcon = (score) => {
        if (score >= 90) return <Trophy className="w-8 h-8 text-yellow-500" />;
        if (score >= 80) return <Award className="w-8 h-8 text-blue-500" />;
        if (score >= 70) return <TrendingUp className="w-8 h-8 text-green-500" />;
        if (score >= 60) return <Target className="w-8 h-8 text-orange-500" />;
        return <RefreshCw className="w-8 h-8 text-red-500" />;
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
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/tests')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Quay lại danh sách bài kiểm tra
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

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/tests')}
                            className="flex items-center p-2 hover:bg-white/20 rounded-lg"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
                        </button>
                        <h1 className="text-2xl font-bold">Kết quả bài kiểm tra</h1>
                        <div className="w-10" />
                    </div>
                </div>

                {result && quiz && (
                    <>
                        {/* Score Summary */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                            <div className="text-center mb-6">
                                <div className="flex justify-center mb-4">
                                    {getScoreIcon(result.score)}
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {quiz.title}
                                </h2>
                                <p className="text-gray-600 mb-4">{quiz.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                                    <div className={`text-4xl font-bold ${getScoreColor(result.score)} mb-2`}>
                                        {result.score}%
                                    </div>
                                    <div className="text-sm text-gray-600">Điểm số</div>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                                    <div className="text-4xl font-bold text-blue-600 mb-2">
                                        {result.correctAnswers}
                                    </div>
                                    <div className="text-sm text-gray-600">Câu đúng</div>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                                    <div className="text-4xl font-bold text-red-600 mb-2">
                                        {result.totalQuestions - result.correctAnswers}
                                    </div>
                                    <div className="text-sm text-gray-600">Câu sai</div>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                                    <div className="text-4xl font-bold text-purple-600 mb-2">
                                        {result.totalQuestions}
                                    </div>
                                    <div className="text-sm text-gray-600">Tổng câu hỏi</div>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-lg text-gray-700 mb-4">
                                    {getScoreMessage(result.score)}
                                </p>

                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={() => navigate(`/tests/${quizId}`)}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Làm lại bài kiểm tra
                                    </button>

                                    <button
                                        onClick={() => navigate('/tests')}
                                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                                    >
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        Xem bài kiểm tra khác
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Results */}
                        {submissions.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                    <BarChart3 className="w-5 h-5 mr-2" />
                                    Chi tiết câu trả lời
                                </h3>

                                <div className="space-y-6">
                                    {submissions.map((submission, index) => (
                                        <div
                                            key={submission.submission_id}
                                            className={`p-4 rounded-lg border-l-4 ${submission.is_correct
                                                ? 'bg-green-50 border-green-500'
                                                : 'bg-red-50 border-red-500'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-gray-500 mr-3">
                                                        Câu {index + 1}
                                                    </span>
                                                    {submission.is_correct ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-500" />
                                                    )}
                                                </div>
                                                <span className={`text-sm font-medium ${submission.is_correct ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {submission.is_correct ? 'Đúng' : 'Sai'}
                                                </span>
                                            </div>

                                            <div className="mb-3">
                                                <p className="text-gray-900 font-medium mb-2">
                                                    {submission.quizquestion?.question}
                                                </p>

                                                <div className="space-y-2">
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-gray-600 w-20">Đáp án của bạn:</span>
                                                        <span className={`text-sm font-medium ${submission.is_correct ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                            {submission.user_answer}
                                                        </span>
                                                    </div>

                                                    {!submission.is_correct && (
                                                        <div className="flex items-center">
                                                            <span className="text-sm text-gray-600 w-20">Đáp án đúng:</span>
                                                            <span className="text-sm font-medium text-green-600">
                                                                {submission.quizquestion?.answerkeys?.find(a => a.is_correct)?.option_text}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {submission.quizquestion?.difficulty && (
                                                <div className="flex items-center">
                                                    <span className="text-xs text-gray-500 mr-2">Độ khó:</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${submission.quizquestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                        submission.quizquestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {submission.quizquestion.difficulty === 'easy' ? 'Dễ' :
                                                            submission.quizquestion.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Performance Analysis */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2" />
                                Phân tích hiệu suất
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 mb-2">
                                        {result.totalQuestions > 0 ? Math.round((result.correctAnswers / result.totalQuestions) * 100) : 0}%
                                    </div>
                                    <div className="text-sm text-gray-600">Tỷ lệ đúng</div>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 mb-2">
                                        {result.totalQuestions > 0 ? Math.round((result.correctAnswers / result.totalQuestions) * 10) : 0}/10
                                    </div>
                                    <div className="text-sm text-gray-600">Điểm thang 10</div>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 mb-2">
                                        {result.score >= 90 ? 'A' : result.score >= 80 ? 'B' : result.score >= 70 ? 'C' : result.score >= 60 ? 'D' : 'F'}
                                    </div>
                                    <div className="text-sm text-gray-600">Xếp loại</div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Gợi ý cải thiện:</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    {result.score < 60 && (
                                        <li>• Ôn tập lại toàn bộ kiến thức cơ bản</li>
                                    )}
                                    {result.score >= 60 && result.score < 80 && (
                                        <li>• Tập trung vào các phần còn yếu</li>
                                    )}
                                    {result.score >= 80 && (
                                        <li>• Duy trì và nâng cao kiến thức hiện tại</li>
                                    )}
                                    <li>• Làm thêm các bài kiểm tra tương tự</li>
                                    <li>• Tham khảo tài liệu học tập bổ sung</li>
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default TestResult; 