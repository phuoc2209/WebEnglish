import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Clock, Check, ArrowLeft, AlertCircle } from 'lucide-react';
import {
  getQuizById,
  submitAnswer,
  calculateTestScore,
  createTestAttempt
} from '../../models/test.model';
import { updateLearningProgress } from '../../models/learningProgress.model';
import { useUserStore } from '../../store/userSlice';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

const Test = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(15 * 60); // Default 15 minutes
  const [showConfirm, setShowConfirm] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [pagination, setPagination] = useState({
    limit: 5,  // Số câu hỏi mỗi trang
    offset: 0, // Vị trí bắt đầu
    total: 0   // Tổng số câu hỏi
  });

  // Load quiz data from backend
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated
        if (!user || !user.user_id) {
          setError('Vui lòng đăng nhập để làm bài kiểm tra');
          return;
        }

        const response = await getQuizById(parseInt(quizId));

        if (response.status === 'success') {
          const quizData = response.data;
          setQuiz(quizData);

          // Set duration if available in quiz data (assuming 15 minutes default)
          const duration = quizData.duration || 15 * 60;
          setTimeLeft(duration);

          // Create attempt record (this would typically be done via API)
          const currentTime = new Date();
          setStartTime(currentTime);

          // Create attempt via API
          try {
            const attemptResponse = await createTestAttempt(user.user_id, parseInt(quizId));
            if (attemptResponse.status === 'success') {
              setAttemptId(attemptResponse.data.attempt_id);
            } else {
              throw new Error(attemptResponse.message || 'Không thể tạo lượt làm bài');
            }
          } catch (attemptError) {
            console.error('Error creating attempt:', attemptError);
            setError('Không thể tạo lượt làm bài. Vui lòng thử lại.');
            return;
          }

          // Set pagination total
          setPagination(prev => ({
            ...prev,
            total: quizData.quizquestions?.length || 0
          }));

        } else {
          setError(response.message || 'Không thể tải bài kiểm tra');
        }
      } catch (err) {
        setError(err.message || 'Lỗi kết nối đến máy chủ');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      loadQuiz();
    }
  }, [quizId, user]);

  // Timer countdown
  useEffect(() => {
    if (!quiz || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.quizquestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // Nếu câu hỏi hiện tại là cuối cùng của trang, chuyển trang
      if ((currentQuestionIndex + 1) % pagination.limit === 0) {
        handlePageChange(pagination.offset + pagination.limit);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Nếu câu hỏi hiện tại là đầu tiên của trang, chuyển trang
      if (currentQuestionIndex % pagination.limit === 0) {
        handlePageChange(pagination.offset - pagination.limit);
      }
    }
  };

  const handlePageChange = (newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
    // Đặt câu hỏi đầu tiên của trang mới làm câu hỏi hiện tại
    setCurrentQuestionIndex(newOffset);
  };

  const currentQuestions = quiz?.quizquestions?.slice(
    pagination.offset,
    pagination.offset + pagination.limit
  ) || [];

  const handleSubmit = async () => {
    try {
      const finishTime = new Date();
      const submissions = [];

      // Process each question and create submissions
      for (const question of quiz.quizquestions) {
        const answerId = answers[question.question_id];
        const selectedOption = question.answerkeys?.find(option => option.answer_id === answerId);

        const submission = {
          submission_id: Math.random(), // This would be generated by backend
          attempt_id: attemptId,
          question_id: question.question_id,
          user_answer: selectedOption ? selectedOption.option_text : null,
          is_correct: selectedOption ? selectedOption.is_correct : false
        };

        submissions.push(submission);

        // Submit each answer to backend (if API supports individual submissions)
        try {
          await submitAnswer({
            attemptId: attemptId,
            questionId: question.question_id,
            userAnswer: selectedOption ? selectedOption.option_text : null
          });
        } catch (submitError) {
          console.warn('Error submitting individual answer:', submitError);
        }
      }

      // Calculate score
      const correctAnswers = submissions.filter(s => s.is_correct).length;
      const score = (correctAnswers / quiz.quizquestions.length) * 100;

      // Cập nhật tiến trình học tập cho bài kiểm tra
      try {
        await updateLearningProgress({
          user_id: user.user_id,
          lesson_type: 'quiz',
          lesson_id: parseInt(quizId),
          progress_percent: score,
          status: score >= 70 ? 'completed' : 'in_progress'
        });
        console.log('Đã cập nhật tiến trình học tập cho quiz:', quizId);
      } catch (progressError) {
        console.error('Lỗi cập nhật tiến trình học tập:', progressError);
      }

      // Create attempt data for logging
      const attemptData = {
        attempt_id: attemptId,
        user_id: user.user_id,
        quiz_id: parseInt(quizId),
        started_at: startTime.toISOString(),
        score
      };

      // Create progress data
      const progressData = {
        progress_id: Math.random(),
        user_id: user.user_id,
        lesson_type: 'quiz',
        lesson_id: parseInt(quizId),
        status: 'completed',
        progress_percent: 100,
        last_accessed_at: finishTime.toISOString()
      };

      console.log('Lưu lượt làm bài:', attemptData);
      console.log('Lưu câu trả lời:', submissions);
      console.log('Cập nhật tiến độ:', progressData);

      // Try to calculate score via backend
      try {
        const scoreResponse = await calculateTestScore(attemptId);
        if (scoreResponse.status === 'success') {
          console.log('Backend calculated score:', scoreResponse.data);
        }
      } catch (scoreError) {
        console.warn('Error calculating score via backend:', scoreError);
      }

      // Navigate to results
      navigate(`/tests/${quizId}/result`, {
        state: {
          submissions,
          score,
          correctAnswers,
          totalQuestions: quiz.quizquestions.length,
          quizTitle: quiz.title,
          attemptId: attemptId
        }
      });

    } catch (err) {
      console.error('Error submitting test:', err);
      setError('Lỗi khi nộp bài. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/tests')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Quay lại danh sách bài kiểm tra
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.quizquestions || quiz.quizquestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy bài kiểm tra</h2>
          <p className="text-gray-600 mb-6">Bài kiểm tra này không tồn tại hoặc chưa có câu hỏi.</p>
          <button
            onClick={() => navigate('/tests')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Quay lại danh sách bài kiểm tra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-purple-100 mt-2">{quiz.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span className={timeLeft < 300 ? 'text-red-200' : ''}>{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {quiz.quizquestions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  // Tính toán trang dựa trên chỉ mục câu hỏi
                  const newOffset = Math.floor(index / pagination.limit) * pagination.limit;
                  if (newOffset !== pagination.offset) {
                    handlePageChange(newOffset);
                  }
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${index === currentQuestionIndex
                  ? 'bg-purple-600 text-white'
                  : answers[quiz.quizquestions[index].question_id]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Questions Container */}
        <div className="space-y-6 mb-6">
          {currentQuestions.map((question, questionIndex) => {
            const globalIndex = pagination.offset + questionIndex;
            const isActive = globalIndex === currentQuestionIndex;

            return (
              <div
                key={question.question_id}
                className={`bg-white rounded-xl shadow-lg p-6 transition-all ${isActive ? 'ring-2 ring-purple-500' : ''}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    Câu {globalIndex + 1} / {quiz.quizquestions.length}
                  </span>
                  <span className="text-sm text-gray-600">
                    {question.difficulty?.toUpperCase() || 'MEDIUM'}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {question.question}
                </h2>

                {/* Answer options */}
                <div className="space-y-4">
                  {question.answerkeys?.map(option => (
                    <button
                      key={option.answer_id}
                      onClick={() => handleAnswerSelect(question.question_id, option.answer_id)}
                      className={`w-full p-4 text-left border rounded-lg transition-colors ${answers[question.question_id] === option.answer_id
                        ? 'bg-blue-100 border-blue-500'
                        : 'border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {option.option_text}
                    </button>
                  )) || (
                      <div className="text-center text-gray-500 py-8">
                        Không có lựa chọn nào cho câu hỏi này
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex justify-center mb-6">
            <button
              className="mx-2 px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              disabled={pagination.offset === 0}
              onClick={() => handlePageChange(pagination.offset - pagination.limit)}
            >
              Trang trước
            </button>
            <span className="mx-2 py-2">
              Trang {Math.floor(pagination.offset / pagination.limit) + 1} / {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              className="mx-2 px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              disabled={pagination.offset + pagination.limit >= pagination.total}
              onClick={() => handlePageChange(pagination.offset + pagination.limit)}
            >
              Trang sau
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 text-gray-600 disabled:opacity-50 rounded-lg hover:bg-gray-100 disabled:hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Trước
          </button>

          {currentQuestionIndex < quiz.quizquestions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Tiếp theo
            </button>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <Check className="w-4 h-4 mr-2" /> Nộp bài
            </button>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Xác nhận nộp bài</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc muốn nộp bài? Bạn đã trả lời{' '}
                {Object.keys(answers).length} / {quiz.quizquestions.length} câu.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Nộp bài
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Test;