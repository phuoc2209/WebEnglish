import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Lightbulb,
    Award,
    RotateCcw,
    Play,
    Pause
} from 'lucide-react';
import { getLessonById, submitExerciseSubmission, getLessonProgressAndAnswers } from '../../models/lesson.model';
import { useCheckAuth } from '../../hooks/useCheckAuth';
import { useUserStore } from '../../store/userSlice';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import LessonActionButtons from '../../components/LessonActionButtons';
import LessonReviewModal from '../../components/LessonReviewModal';

const GrammarDetail = () => {
    const { grammarId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useUserStore();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [lessonProgress, setLessonProgress] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isLessonStarted, setIsLessonStarted] = useState(false);

    // Lấy mode từ URL params
    const mode = searchParams.get('mode');

    useCheckAuth();

    useEffect(() => {
        const fetchLessonAndProgress = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!user?.user_id) throw new Error('Vui lòng đăng nhập để xem bài học');
                const token = localStorage.getItem('token');
                if (!token) {
                    localStorage.removeItem('token');
                    throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
                }

                // Lấy thông tin bài học và tiến độ
                const [lessonResponse, progressResponse] = await Promise.all([
                    getLessonById(grammarId, 'grammar'),
                    getLessonProgressAndAnswers(grammarId, 'grammar')
                ]);

                console.log('Grammar lesson response:', lessonResponse);
                console.log('Progress response:', progressResponse);

                if (lessonResponse.status === 'success') {
                    setLesson(lessonResponse.data);
                } else {
                    throw new Error(lessonResponse.message || 'Không tìm thấy bài học');
                }

                if (progressResponse.status === 'success') {
                    setLessonProgress(progressResponse.data);
                    // Nếu đã có tiến độ, khôi phục câu trả lời mới nhất đã chọn
                    if (progressResponse.data.submissions && progressResponse.data.submissions.length > 0) {
                        const savedAnswers = {};
                        // Lấy câu trả lời mới nhất cho mỗi câu hỏi
                        progressResponse.data.lesson?.exercises?.forEach(exercise => {
                            const exerciseSubmissions = progressResponse.data.submissions.filter(s => s.exercise_id === exercise.exercise_id);
                            if (exerciseSubmissions.length > 0) {
                                // Lấy submission mới nhất
                                const latestSubmission = exerciseSubmissions[exerciseSubmissions.length - 1];
                                savedAnswers[exercise.exercise_id] = latestSubmission.user_answer;
                            }
                        });
                        setSelectedAnswers(savedAnswers);
                    }
                }

                // Xử lý mode từ URL
                if (mode === 'review') {
                    setShowReviewModal(true);
                } else if (mode === 'retry') {
                    // Reset tất cả và bắt đầu lại
                    setSelectedAnswers({});
                    setCurrentQuestionIndex(0);
                    setShowResults(false);
                    setScore(0);
                    setTimeSpent(0);
                    setIsLessonStarted(true);
                    setIsTimerRunning(true);
                } else if (progressResponse.status === 'success' &&
                    progressResponse.data.submissions &&
                    progressResponse.data.submissions.length > 0) {
                    // Nếu có tiến độ, tự động tiếp tục
                    setIsLessonStarted(true);
                    setIsTimerRunning(true);
                }
            } catch (err) {
                console.error('Fetch grammar lesson error:', err.message);
                let errorMessage = err.message || 'Lỗi khi tải bài học ngữ pháp';
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
        fetchLessonAndProgress();
    }, [grammarId, user?.user_id, navigate]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimeSpent(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (questionId, answer) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleStartLesson = () => {
        setIsLessonStarted(true);
        setIsTimerRunning(true);
    };

    const handleRetryLesson = () => {
        setSelectedAnswers({});
        setCurrentQuestionIndex(0);
        setShowResults(false);
        setScore(0);
        setTimeSpent(0);
        setIsLessonStarted(true);
        setIsTimerRunning(true);
    };

    const handleSubmitQuiz = async () => {
        if (!lesson?.exercises) return;

        let correctAnswers = 0;
        // Lưu từng câu trả lời vào backend
        for (const exercise of lesson.exercises) {
            const selectedAnswer = selectedAnswers[exercise.exercise_id];
            if (selectedAnswer === exercise.correct_answer) {
                correctAnswers++;
            }
            // Gọi API lưu kết quả bài tập
            if (user && user.user_id && selectedAnswer) {
                try {
                    await submitExerciseSubmission(exercise.exercise_id, selectedAnswer);
                } catch (err) {
                    console.error('Lỗi lưu kết quả bài tập:', err.message);
                }
            }
        }

        const finalScore = Math.round((correctAnswers / lesson.exercises.length) * 100);
        setScore(finalScore);
        setShowResults(true);
        setIsTimerRunning(false);
    };

    const handleRetry = () => {
        setSelectedAnswers({});
        setCurrentQuestionIndex(0);
        setShowResults(false);
        setScore(0);
        setTimeSpent(0);
        setIsTimerRunning(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < lesson.exercises.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const parseOptions = (options) => {
        if (!options) return [];
        if (Array.isArray(options)) return options;
        if (typeof options === 'object') return Object.values(options);
        if (typeof options === 'string') {
            try {
                const parsed = JSON.parse(options);
                if (Array.isArray(parsed)) return parsed;
                if (typeof parsed === 'object') return Object.values(parsed);
            } catch (e) {
                return [options];
            }
        }
        return [];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">Không tìm thấy bài học</div>
                        <button
                            onClick={() => navigate('/grammar')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Nếu chưa bắt đầu bài học và không phải mode review, hiển thị màn hình chào mừng
    if (!isLessonStarted && mode !== 'review') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <Navbar />

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => navigate('/grammar')}
                                className="flex items-center text-blue-100 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Quay lại
                            </button>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
                        <p className="text-blue-100">{lesson.description}</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="text-center mb-8">
                            <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {lesson.title}
                            </h2>
                            <p className="text-gray-600">
                                {lesson.description}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <LessonActionButtons
                            lessonProgress={lessonProgress}
                            onStart={handleStartLesson}
                            onContinue={handleStartLesson}
                            onReview={() => setShowReviewModal(true)}
                            onRetry={handleRetryLesson}
                            isLoading={loading}
                        />
                    </div>
                </div>

                {/* Review Modal */}
                <LessonReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    lessonData={lessonProgress?.lesson}
                    submissions={lessonProgress?.submissions}
                    progress={lessonProgress?.progress}
                    lessonType="grammar"
                />

                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <Navbar />

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/grammar')}
                            className="flex items-center text-blue-100 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Quay lại
                        </button>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center text-blue-100">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{formatTime(timeSpent)}</span>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
                    <p className="text-blue-100">{lesson.description}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Lesson Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Grammar Explanation */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center mb-4">
                                <BookOpen className="w-6 h-6 text-blue-600 mr-2" />
                                <h2 className="text-xl font-semibold">Grammar Explanation</h2>
                            </div>
                            <div className="prose max-w-none">
                                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                    <h3 className="font-semibold text-blue-800 mb-2">Key Points:</h3>
                                    <div className="text-blue-700 whitespace-pre-wrap">
                                        {lesson.content}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Examples */}
                        {lesson.examples && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center mb-4">
                                    <Lightbulb className="w-6 h-6 text-blue-600 mr-2" />
                                    <h2 className="text-xl font-semibold">Examples</h2>
                                </div>
                                <div className="space-y-3">
                                    {lesson.examples.split('\n').map((example, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                                            <p className="text-gray-700 italic">"{example.trim()}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quiz Section */}
                        {lesson.exercises && lesson.exercises.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold">Practice Quiz</h2>
                                    <div className="text-sm text-gray-600">
                                        Question {currentQuestionIndex + 1} of {lesson.exercises.length}
                                    </div>
                                </div>

                                {!showResults ? (
                                    <div>
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium mb-4">
                                                {lesson.exercises[currentQuestionIndex]?.question || 'Question not available'}
                                            </h3>
                                            <div className="space-y-3">
                                                {lesson.exercises[currentQuestionIndex] && (
                                                    console.log('Options for question', lesson.exercises[currentQuestionIndex].exercise_id, parseOptions(lesson.exercises[currentQuestionIndex].options)),
                                                    parseOptions(lesson.exercises[currentQuestionIndex].options).map((option, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleAnswerSelect(
                                                                lesson.exercises[currentQuestionIndex].exercise_id,
                                                                option
                                                            )}
                                                            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${selectedAnswers[lesson.exercises[currentQuestionIndex].exercise_id] === option
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            {option}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-between">
                                            <button
                                                onClick={handlePrevQuestion}
                                                disabled={currentQuestionIndex === 0}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            {currentQuestionIndex === lesson.exercises.length - 1 ? (
                                                <button
                                                    onClick={handleSubmitQuiz}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    Submit Quiz
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleNextQuestion}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    Next
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="mb-6">
                                            {score >= 80 ? (
                                                <div className="flex items-center justify-center text-green-600 mb-4">
                                                    <Award className="w-12 h-12 mr-2" />
                                                    <span className="text-2xl font-bold">Excellent!</span>
                                                </div>
                                            ) : score >= 60 ? (
                                                <div className="flex items-center justify-center text-yellow-600 mb-4">
                                                    <CheckCircle className="w-12 h-12 mr-2" />
                                                    <span className="text-2xl font-bold">Good Job!</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center text-red-600 mb-4">
                                                    <XCircle className="w-12 h-12 mr-2" />
                                                    <span className="text-2xl font-bold">Keep Practicing!</span>
                                                </div>
                                            )}
                                            <div className="text-4xl font-bold text-gray-800 mb-2">{score}%</div>
                                            <div className="text-gray-600 mb-6">
                                                You got {Math.round((score / 100) * lesson.exercises.length)} out of {lesson.exercises.length} questions correct
                                            </div>
                                            <button
                                                onClick={handleRetry}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                <RotateCcw className="w-4 h-4 inline mr-2" />
                                                Try Again
                                            </button>
                                        </div>
                                        <div className="mt-8 text-left">
                                            <h4 className="text-lg font-semibold mb-4 text-gray-800">Detailed Results:</h4>
                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                {lesson.exercises.map((exercise, idx) => {
                                                    const options = parseOptions(exercise.options);
                                                    const selected = selectedAnswers[exercise.exercise_id];
                                                    const isCorrect = selected === exercise.correct_answer;
                                                    return (
                                                        <div
                                                            key={exercise.exercise_id}
                                                            className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}
                                                        >
                                                            <div className="flex items-start justify-between mb-2">
                                                                <h5 className="font-medium text-gray-800">
                                                                    Question {idx + 1}: {exercise.question}
                                                                </h5>
                                                                {isCorrect ? (
                                                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                                ) : (
                                                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                                                )}
                                                            </div>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex items-center">
                                                                    <span className="font-medium text-gray-700 w-28">Your answer:</span>
                                                                    <span className={`ml-2 font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                                        {selected !== undefined ? selected : 'No answer'}
                                                                    </span>
                                                                </div>
                                                                {!isCorrect && (
                                                                    <div className="flex items-center">
                                                                        <span className="font-medium text-gray-700 w-28">Correct answer:</span>
                                                                        <span className="ml-2 text-green-700 font-bold">
                                                                            {exercise.correct_answer}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Progress & Stats */}
                    <div className="space-y-6">
                        {/* Progress Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span>Time Spent</span>
                                    <span className="font-medium">{formatTime(timeSpent)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Questions Answered</span>
                                    <span className="font-medium">{Object.keys(selectedAnswers).length}/{lesson.exercises?.length || 0}</span>
                                </div>
                                {showResults && (
                                    <div className="flex justify-between text-sm">
                                        <span>Score</span>
                                        <span className="font-medium text-blue-600">{score}%</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Study Tips</h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <p>Read the explanation carefully before attempting the quiz</p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <p>Pay attention to the examples provided</p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <p>Review your answers before submitting</p>
                                </div>
                            </div>
                        </div>

                        {/* Lesson Info */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Lesson Info</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Level:</span>
                                    <span className="font-medium capitalize">{lesson.level || 'Beginner'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Category:</span>
                                    <span className="font-medium">{lesson.category || 'General Grammar'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Questions:</span>
                                    <span className="font-medium">{lesson.exercises?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* Review Modal */}
            <LessonReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                lessonData={lessonProgress?.lesson}
                submissions={lessonProgress?.submissions}
                progress={lessonProgress?.progress}
                lessonType="grammar"
            />
        </div>
    );
};

export default GrammarDetail;
