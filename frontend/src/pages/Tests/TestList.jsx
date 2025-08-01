import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Award, ChevronRight, AlertCircle } from 'lucide-react';
import {
  getAllQuizzes,
  getUserTestAttempts,
  getQuizStatistics
} from '../../models/test.model';
import {
  getLearningProgressByUserId,
  updateLearningProgress
} from '../../models/learningProgress.model';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

const TestList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [userAttempts, setUserAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0
  });
  const [pagination, setPagination] = useState({
    limit: 6,
    offset: 0,
    total: 0
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.user_id) {
      loadData(user.user_id);
    }
  }, [user]);

  const loadData = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const [quizRes, progressRes, attemptsRes] = await Promise.all([
        getAllQuizzes({ page: 1, pageSize: 100 }),
        getLearningProgressByUserId(userId),
        getUserTestAttempts(userId)
      ]);

      const quizzesData = quizRes.status === 'success' ? quizRes.data.rows : [];
      const progressData = progressRes.status === 'success' ? progressRes.data : [];
      const attemptsData = attemptsRes.status === 'success' ? attemptsRes.data : [];

      const quizzesWithStats = await Promise.all(
        quizzesData.map(async (quiz) => {
          try {
            const statRes = await getQuizStatistics(quiz.quiz_id);
            return {
              ...quiz,
              statistics: statRes.status === 'success' ? statRes.data : null
            };
          } catch {
            return { ...quiz, statistics: null };
          }
        })
      );

      setQuizzes(quizzesWithStats);
      setUserProgress(progressData);
      setUserAttempts(attemptsData);

      setPagination(prev => ({ ...prev, total: quizzesWithStats.length }));

      const completedAttempts = attemptsData.filter(a => a.completed_at);
      const totalScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);

      setStatistics({
        totalQuizzes: quizzesData.length,
        completedQuizzes: completedAttempts.length,
        averageScore: completedAttempts.length ? Math.round(totalScore / completedAttempts.length) : 0
      });

    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (quiz) => {
    try {
      const progress = userProgress.find(p => p.lesson_type === 'quiz' && p.lesson_id === quiz.quiz_id);
      await updateLearningProgress({
        user_id: user.user_id,
        lesson_type: 'quiz',
        lesson_id: quiz.quiz_id,
        progress_percent: progress ? progress.progress_percent : 10
      });
      navigate(`/tests/${quiz.quiz_id}`);
    } catch (err) {
      console.error('Không thể cập nhật tiến độ:', err);
      navigate(`/tests/${quiz.quiz_id}`);
    }
  };

  const paginatedQuizzes = quizzes.slice(pagination.offset, pagination.offset + pagination.limit);

  const handlePageChange = (direction) => {
    setPagination(prev => {
      const newOffset = direction === 'next'
        ? Math.min(prev.offset + prev.limit, prev.total - prev.limit)
        : Math.max(prev.offset - prev.limit, 0);
      return { ...prev, offset: newOffset };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="grid grid-cols-3 gap-4 text-center mb-6">
        <div>
          <p className="text-gray-500 text-sm">Tổng số bài</p>
          <p className="text-xl font-bold text-purple-700">{statistics.totalQuizzes}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Đã hoàn thành</p>
          <p className="text-xl font-bold text-green-600">{statistics.completedQuizzes}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Điểm trung bình</p>
          <p className="text-xl font-bold text-blue-600">{statistics.averageScore}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {paginatedQuizzes.map((quiz) => {
          const progress = userProgress.find(p => p.lesson_type === 'quiz' && p.lesson_id === quiz.quiz_id);
          const attempts = userAttempts.filter(a => a.quiz_id === quiz.quiz_id);
          const lastAttempt = attempts.sort((a, b) => new Date(b.started_at) - new Date(a.started_at))[0];
          const averageScore = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.length) : 0;
          return (
            <div key={quiz.quiz_id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{quiz.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{quiz.description}</p>
              <p className="text-xs text-gray-500 mb-1">{quiz.quizquestions?.length || 0} câu hỏi</p>
              {progress?.progress_percent > 0 && (
                <p className="text-xs text-gray-500 mb-1">Tiến độ: {progress.progress_percent}%</p>
              )}
              <p className="text-xs text-gray-500 mb-3">Điểm TB: {averageScore}%</p>
              <button
                onClick={() => handleStartQuiz(quiz)}
                className="w-full bg-purple-600 text-white rounded px-3 py-2 text-sm hover:bg-purple-700"
              >
                {lastAttempt?.completed_at ? 'Làm lại' : 'Bắt đầu'}
                <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Pagination controls */}
      {pagination.total > pagination.limit && (
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => handlePageChange('prev')}
            disabled={pagination.offset === 0}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="py-2 text-gray-700">
            Trang {Math.floor(pagination.offset / pagination.limit) + 1} / {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            onClick={() => handlePageChange('next')}
            disabled={pagination.offset + pagination.limit >= pagination.total}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default TestList;
