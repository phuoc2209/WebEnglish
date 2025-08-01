import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Clock,
    FileText,
    Eye
} from 'lucide-react';
import { getSkillLessonById, submitSkillSubmission } from '../../models/skill.model';
import { getLessonProgressAndAnswers } from '../../models/lesson.model';
import { useCheckAuth } from '../../hooks/useCheckAuth';
import { useUserStore } from '../../store/userSlice';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import LessonActionButtons from '../../components/LessonActionButtons';
import LessonReviewModal from '../../components/LessonReviewModal';

const ReadingExercise = () => {
    const { skillId } = useParams();
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [readingTime, setReadingTime] = useState(0);
    const [isReading, setIsReading] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState({});
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);
    const [lessonProgress, setLessonProgress] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isLessonStarted, setIsLessonStarted] = useState(false);

    const readingStartTimeRef = useRef(null);

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
                    getSkillLessonById(skillId),
                    getLessonProgressAndAnswers(skillId, 'reading')
                ]);

                console.log('Lesson response:', lessonResponse);
                console.log('Progress response:', progressResponse);

                if (lessonResponse.status === 'success') {
                    setLesson(lessonResponse.data);
                } else {
                    throw new Error(lessonResponse.message);
                }

                if (progressResponse.status === 'success') {
                    setLessonProgress(progressResponse.data);
                    // Nếu đã có tiến độ, khôi phục câu trả lời đã chọn
                    if (progressResponse.data.submissions && progressResponse.data.submissions.length > 0) {
                        const savedAnswers = {};
                        progressResponse.data.submissions.forEach(submission => {
                            // Parse user_answer từ JSON string
                            try {
                                const userAnswers = JSON.parse(submission.user_answer);
                                const exerciseIds = JSON.parse(progressResponse.data.lesson.question);
                                exerciseIds.forEach((question, index) => {
                                    if (userAnswers[index]) {
                                        savedAnswers[question] = userAnswers[index];
                                    }
                                });
                            } catch (e) {
                                console.error('Error parsing saved answers:', e);
                            }
                        });
                        setSelectedAnswers(savedAnswers);
                    }
                }
            } catch (err) {
                console.error('Fetch lesson error:', err.message);
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
        fetchLessonAndProgress();
    }, [skillId, user?.user_id, navigate]);

    const startReading = () => {
        setIsReading(true);
        readingStartTimeRef.current = Date.now();
    };

    const handleAnswerSelect = (questionId, answer) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleStartLesson = () => {
        setIsLessonStarted(true);
        startReading();
    };

    const handleContinueLesson = () => {
        setIsLessonStarted(true);
        startReading();
    };

    const handleReviewLesson = () => {
        setShowReviewModal(true);
    };

    const handleRetryLesson = () => {
        setSelectedAnswers({});
        setCurrentQuestionIndex(0);
        setShowResults(false);
        setScore(0);
        setReadingTime(0);
        setIsReading(false);
        setCorrectAnswers({});
        setIncorrectQuestions([]);
        setIsLessonStarted(true);
        startReading();
    };

    const handleSubmitQuiz = async () => {
        try {
            const endTime = Date.now();
            const readingDuration = Math.round((endTime - readingStartTimeRef.current) / 1000);
            setReadingTime(readingDuration);

            // Tính toán kết quả chi tiết
            const calculatedScore = calculateScore();
            const questions = lesson.exercises.map(exercise => ({
                question: exercise.question,
                options: exercise.options,
                user_answer: selectedAnswers[exercise.exercise_id],
                is_correct: selectedAnswers[exercise.exercise_id] === exercise.correct_answer
            }));
            const is_correct = questions.map(q => q.is_correct);
            const user_answer = questions.map(q => q.user_answer);
            const options = questions.map(q => q.options);
            const question = questions.map(q => q.question);

            setCorrectAnswers(lesson.exercises.reduce((acc, exercise) => {
                acc[exercise.exercise_id] = exercise.correct_answer;
                return acc;
            }, {}));
            setIncorrectQuestions(lesson.exercises.filter(exercise => selectedAnswers[exercise.exercise_id] !== exercise.correct_answer).map(exercise => ({
                exercise_id: exercise.exercise_id,
                question: exercise.question,
                userAnswer: selectedAnswers[exercise.exercise_id],
                correctAnswer: exercise.correct_answer
            })));

            const submissionData = {
                user_id: user?.user_id,
                skill_id: skillId,
                skill_type: lesson.skill_type,
                question: JSON.stringify(question),
                options: JSON.stringify(options),
                user_answer: JSON.stringify(user_answer),
                is_correct: JSON.stringify(is_correct),
                score: calculatedScore,
                reading_time: readingDuration,
                submitted_at: new Date().toISOString()
            };

            const response = await submitSkillSubmission(submissionData);
            console.log('Submission response:', response);
            setShowResults(true);
        } catch (err) {
            console.error('Submit error:', err);
            setError('Lỗi khi nộp bài. Vui lòng thử lại.');
        }
    };

    const calculateScore = () => {
        if (!lesson?.exercises) return 0;

        let correctAnswers = 0;
        lesson.exercises.forEach(exercise => {
            const selectedAnswer = selectedAnswers[exercise.exercise_id];
            if (selectedAnswer === exercise.correct_answer) {
                correctAnswers++;
            }
        });

        const score = Math.round((correctAnswers / lesson.exercises.length) * 100);
        setScore(score);
        return score;
    };

    const handleRetry = () => {
        setSelectedAnswers({});
        setCurrentQuestionIndex(0);
        setShowResults(false);
        setScore(0);
        setReadingTime(0);
        setIsReading(false);
        setCorrectAnswers({});
        setIncorrectQuestions([]);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                            onClick={() => navigate('/reading')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Nếu chưa bắt đầu bài học, hiển thị màn hình chào mừng với các nút hành động
    if (!isLessonStarted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <Navbar />

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => navigate('/reading')}
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
                            onContinue={handleContinueLesson}
                            onReview={handleReviewLesson}
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
                    lessonType="reading"
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
                    <div className="flex items-center mb-4">
                        <button
                            onClick={() => navigate('/reading')}
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

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Reading Passage */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <FileText className="w-6 h-6 text-blue-600 mr-2" />
                                    <h2 className="text-xl font-semibold">Reading Passage</h2>
                                </div>
                                {isReading && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>Reading time: {formatTime(readingTime)}</span>
                                    </div>
                                )}
                            </div>

                            {!isReading ? (
                                <div className="text-center py-8">
                                    <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Ready to read?</h3>
                                    <p className="text-gray-600 mb-4">
                                        Take your time to read the passage carefully. You can refer back to it while answering the questions.
                                    </p>
                                    <button
                                        onClick={startReading}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Start Reading
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                        <div className="prose prose-lg max-w-none">
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {lesson.reading_content || 'No reading content available for this lesson.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-blue-800 mb-2">Reading Tips:</h3>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• Read the passage carefully before answering questions</li>
                                            <li>• Look for key details and main ideas</li>
                                            <li>• Pay attention to context clues</li>
                                            <li>• You can refer back to the passage while answering</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Quiz */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Reading Comprehension Quiz</h2>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Eye className="w-4 h-4 mr-1" />
                                    <span>Question {currentQuestionIndex + 1} of {lesson.exercises?.length || 0}</span>
                                </div>
                            </div>

                            {!showResults ? (
                                <>
                                    {isReading && lesson.exercises && lesson.exercises.length > 0 ? (
                                        <div className="space-y-6">
                                            {lesson.exercises.map((exercise, index) => (
                                                <div
                                                    key={exercise.exercise_id}
                                                    className={`${index === currentQuestionIndex ? 'block' : 'hidden'}`}
                                                >
                                                    <h3 className="text-lg font-medium mb-4">
                                                        {index + 1}. {exercise.question}
                                                    </h3>

                                                    <div className="space-y-3">
                                                        {exercise.options && (
                                                            console.log('Options for question', exercise.exercise_id, parseOptions(exercise.options)),
                                                            parseOptions(exercise.options).map((option, optionIndex) => (
                                                                <label
                                                                    key={optionIndex}
                                                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedAnswers[exercise.exercise_id] === option
                                                                        ? 'border-blue-500 bg-blue-50'
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                        }`}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`question-${exercise.exercise_id}`}
                                                                        value={option}
                                                                        checked={selectedAnswers[exercise.exercise_id] === option}
                                                                        onChange={() => handleAnswerSelect(exercise.exercise_id, option)}
                                                                        className="sr-only"
                                                                    />
                                                                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${selectedAnswers[exercise.exercise_id] === option
                                                                        ? 'border-blue-500 bg-blue-500'
                                                                        : 'border-gray-300'
                                                                        }`}>
                                                                        {selectedAnswers[exercise.exercise_id] === option && (
                                                                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-gray-700">{option}</span>
                                                                </label>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="flex justify-between pt-6">
                                                <button
                                                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                                    disabled={currentQuestionIndex === 0}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Previous
                                                </button>

                                                {currentQuestionIndex < lesson.exercises.length - 1 ? (
                                                    <button
                                                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                    >
                                                        Next
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleSubmitQuiz}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                    >
                                                        Submit Quiz
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : isReading ? (
                                        <div className="text-center py-8 text-gray-500">
                                            Không có câu hỏi cho bài học này
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Vui lòng bắt đầu đọc để xem câu hỏi
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center space-y-6">
                                    <div className="text-6xl font-bold text-blue-600">{score}%</div>
                                    <h3 className="text-xl font-semibold">
                                        {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : 'Keep practicing!'}
                                    </h3>
                                    <p className="text-gray-600">
                                        You got {Math.round((score / 100) * (lesson.exercises?.length || 0))} out of {lesson.exercises?.length || 0} questions correct.
                                    </p>
                                    <p className="text-gray-600">
                                        Reading time: {formatTime(readingTime)}
                                    </p>

                                    {/* Detailed Results */}
                                    <div className="mt-6 text-left bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-semibold mb-4 text-gray-800">Detailed Results:</h4>
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {lesson.exercises && lesson.exercises.length > 0 ? (
                                                lesson.exercises.map((exercise, index) => {
                                                    const selectedAnswer = selectedAnswers[exercise.exercise_id];
                                                    const isCorrect = selectedAnswer === exercise.correct_answer;

                                                    return (
                                                        <div
                                                            key={exercise.exercise_id}
                                                            className={`p-4 rounded-lg border-2 ${isCorrect
                                                                ? 'border-green-300 bg-green-50'
                                                                : 'border-red-300 bg-red-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between mb-3">
                                                                <h5 className="font-semibold text-gray-800 flex-1">
                                                                    <span className="text-blue-600">Question {index + 1}:</span> {exercise.question}
                                                                </h5>
                                                                <div className="ml-2">
                                                                    {isCorrect ? (
                                                                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                                                    ) : (
                                                                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex items-center">
                                                                    <span className="font-medium text-gray-700 w-28">Your answer:</span>
                                                                    <span className={`ml-2 font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'
                                                                        }`}>
                                                                        {selectedAnswer || 'No answer'}
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
                                                })
                                            ) : (
                                                <div className="text-center text-gray-500 py-4">
                                                    No exercises found for this lesson.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleRetry}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Try Again
                                        </button>
                                        <button
                                            onClick={() => navigate('/reading')}
                                            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                        >
                                            Back to Lessons
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reading Stats */}
                        {isReading && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Reading Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {lesson.reading_content ? lesson.reading_content.split(' ').length : 0}
                                        </div>
                                        <div className="text-sm text-gray-600">Words</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {lesson.exercises?.length || 0}
                                        </div>
                                        <div className="text-sm text-gray-600">Questions</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ReadingExercise; 