import React from 'react';
import { X, CheckCircle, XCircle, Award, Clock, BookOpen } from 'lucide-react';

const LessonReviewModal = ({
    isOpen,
    onClose,
    lessonData,
    submissions,
    progress,
    lessonType
}) => {
    if (!isOpen) return null;

    // Lấy câu trả lời mới nhất cho mỗi câu hỏi
    const getLatestSubmissions = () => {
        if (!submissions) return [];

        // Xử lý khác nhau cho skill lessons và grammar/vocabulary lessons
        if (lessonType === 'listening' || lessonType === 'reading' || lessonType === 'speaking' || lessonType === 'writing') {
            // Với skill lessons, mỗi submission là một câu trả lời cho một câu hỏi
            // Lấy submission duy nhất cho mỗi câu hỏi
            const uniqueSubmissions = [];
            const seenQuestions = new Set();

            submissions.forEach(submission => {
                // Sử dụng question làm key để xác định câu hỏi duy nhất
                const questionKey = submission.question;
                if (!seenQuestions.has(questionKey)) {
                    seenQuestions.add(questionKey);
                    uniqueSubmissions.push(submission);
                }
            });

            return uniqueSubmissions;
        } else {
            // Với grammar/vocabulary lessons, có exercise_id
            if (!lessonData?.exercises) return [];

            const latestSubmissions = [];
            lessonData.exercises.forEach(exercise => {
                // Tìm tất cả submissions cho câu hỏi này
                const exerciseSubmissions = submissions.filter(s => s.exercise_id === exercise.exercise_id);
                if (exerciseSubmissions.length > 0) {
                    // Lấy submission mới nhất (có thể sắp xếp theo thời gian nếu có)
                    const latestSubmission = exerciseSubmissions[exerciseSubmissions.length - 1];
                    latestSubmissions.push(latestSubmission);
                }
            });

            return latestSubmissions;
        }
    };

    const latestSubmissions = getLatestSubmissions();
    const correctAnswers = latestSubmissions.filter(s => s.is_correct).length;
    const incorrectAnswers = latestSubmissions.filter(s => !s.is_correct).length;
    const totalAnswered = latestSubmissions.length;

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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreDisplay = () => {
        const score = progress?.progress_percent || 0;
        if (score >= 80) {
            return {
                icon: <Award className="w-8 h-8 text-yellow-500" />,
                text: 'Xuất sắc!',
                color: 'text-yellow-600'
            };
        } else if (score >= 60) {
            return {
                icon: <CheckCircle className="w-8 h-8 text-green-500" />,
                text: 'Tốt!',
                color: 'text-green-600'
            };
        } else {
            return {
                icon: <XCircle className="w-8 h-8 text-red-500" />,
                text: 'Cần cải thiện',
                color: 'text-red-600'
            };
        }
    };

    const scoreDisplay = getScoreDisplay();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-800">
                                Kết quả chi tiết - {lessonData?.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Score Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            {scoreDisplay.icon}
                            <div className="text-center">
                                <div className={`text-4xl font-bold ${scoreDisplay.color}`}>
                                    {Math.round(progress?.progress_percent || 0)}%
                                </div>
                                <div className={`text-lg font-medium ${scoreDisplay.color}`}>
                                    {scoreDisplay.text}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-gray-800">
                                    {lessonData?.exercises?.length || 0}
                                </div>
                                <div className="text-sm text-gray-600">Tổng câu hỏi</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {correctAnswers || 0}
                                </div>
                                <div className="text-sm text-gray-600">Đúng</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {incorrectAnswers || 0}
                                </div>
                                <div className="text-sm text-gray-600">Sai</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatDate(progress?.last_accessed_at)}
                                </div>
                                <div className="text-sm text-gray-600">Hoàn thành</div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Results */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Chi tiết từng câu hỏi
                        </h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {(() => {
                                // Xử lý khác nhau cho skill lessons và grammar/vocabulary lessons
                                if (lessonType === 'listening' || lessonType === 'reading' || lessonType === 'speaking' || lessonType === 'writing') {
                                    // Với skill lessons, hiển thị từ submissions
                                    return latestSubmissions.map((submission, index) => {
                                        const isCorrect = submission?.is_correct;
                                        const userAnswer = submission?.user_answer;
                                        const question = submission?.question;

                                        // Parse question và options từ JSON string
                                        let questionText = question;
                                        let options = [];
                                        let correctAnswer = '';

                                        try {
                                            if (question) {
                                                const questionData = JSON.parse(question);
                                                questionText = questionData.question || question;
                                                options = parseOptions(questionData.options);
                                                correctAnswer = questionData.correct_answer || '';
                                            }
                                        } catch (e) {
                                            // Nếu không parse được, sử dụng question gốc
                                            questionText = question;
                                        }

                                        return (
                                            <div
                                                key={submission.submission_id}
                                                className={`p-4 rounded-lg border-2 ${isCorrect
                                                    ? 'border-green-300 bg-green-50'
                                                    : 'border-red-300 bg-red-50'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="font-semibold text-gray-800 flex-1">
                                                        <span className="text-blue-600">Câu {index + 1}:</span> {questionText}
                                                    </h4>
                                                    <div className="ml-2">
                                                        {isCorrect ? (
                                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700 w-24">Đáp án của bạn:</span>
                                                        <span className={`ml-2 font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'
                                                            }`}>
                                                            {userAnswer || 'Chưa trả lời'}
                                                        </span>
                                                    </div>

                                                    {!isCorrect && correctAnswer && (
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-gray-700 w-24">Đáp án đúng:</span>
                                                            <span className="ml-2 text-green-700 font-bold">
                                                                {correctAnswer}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Show options for context */}
                                                    {options.length > 0 && (
                                                        <div className="mt-3">
                                                            <span className="font-medium text-gray-700">Các lựa chọn:</span>
                                                            <div className="mt-1 space-y-1">
                                                                {options.map((option, optionIndex) => (
                                                                    <div
                                                                        key={optionIndex}
                                                                        className={`text-sm p-2 rounded ${option === correctAnswer
                                                                            ? 'bg-green-100 text-green-800 font-medium'
                                                                            : option === userAnswer && !isCorrect
                                                                                ? 'bg-red-100 text-red-800 font-medium'
                                                                                : 'bg-gray-100 text-gray-700'
                                                                            }`}
                                                                    >
                                                                        {option}
                                                                        {option === correctAnswer && (
                                                                            <span className="ml-2 text-green-600">✓</span>
                                                                        )}
                                                                        {option === userAnswer && !isCorrect && (
                                                                            <span className="ml-2 text-red-600">✗</span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    });
                                } else {
                                    // Với grammar/vocabulary lessons, hiển thị từ exercises
                                    return lessonData?.exercises?.map((exercise, index) => {
                                        const submission = latestSubmissions?.find(s => s.exercise_id === exercise.exercise_id);
                                        const isCorrect = submission?.is_correct;
                                        const userAnswer = submission?.user_answer;

                                        return (
                                            <div
                                                key={exercise.exercise_id}
                                                className={`p-4 rounded-lg border-2 ${isCorrect
                                                    ? 'border-green-300 bg-green-50'
                                                    : 'border-red-300 bg-red-50'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="font-semibold text-gray-800 flex-1">
                                                        <span className="text-blue-600">Câu {index + 1}:</span> {exercise.question}
                                                    </h4>
                                                    <div className="ml-2">
                                                        {isCorrect ? (
                                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700 w-24">Đáp án của bạn:</span>
                                                        <span className={`ml-2 font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'
                                                            }`}>
                                                            {userAnswer || 'Chưa trả lời'}
                                                        </span>
                                                    </div>

                                                    {!isCorrect && (
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-gray-700 w-24">Đáp án đúng:</span>
                                                            <span className="ml-2 text-green-700 font-bold">
                                                                {exercise.correct_answer}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Show options for context */}
                                                    <div className="mt-3">
                                                        <span className="font-medium text-gray-700">Các lựa chọn:</span>
                                                        <div className="mt-1 space-y-1">
                                                            {parseOptions(exercise.options).map((option, optionIndex) => (
                                                                <div
                                                                    key={optionIndex}
                                                                    className={`text-sm p-2 rounded ${option === exercise.correct_answer
                                                                        ? 'bg-green-100 text-green-800 font-medium'
                                                                        : option === userAnswer && !isCorrect
                                                                            ? 'bg-red-100 text-red-800 font-medium'
                                                                            : 'bg-gray-100 text-gray-700'
                                                                        }`}
                                                                >
                                                                    {option}
                                                                    {option === exercise.correct_answer && (
                                                                        <span className="ml-2 text-green-600">✓</span>
                                                                    )}
                                                                    {option === userAnswer && !isCorrect && (
                                                                        <span className="ml-2 text-red-600">✗</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                }
                            })()}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonReviewModal; 