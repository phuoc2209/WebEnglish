import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, BookOpen, FileText, Clock } from 'lucide-react';
import { useUserStore } from '../../store/userSlice';
import { getLearningProgressByUserId } from '../../models/learningProgress.model';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

const LearningProgress = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [progressData, setProgressData] = useState({ lessons: [], quizzes: [], overview: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.user_id) {
        setError('Vui lòng đăng nhập để xem tiến độ học tập');
        setLoading(false);
        return;
      }
      try {
        const response = await getLearningProgressByUserId(user.user_id);
        if (response.status === 'success') {
          const lessons = response.data.filter(item => item.lesson_type !== 'quiz');
          const quizzes = response.data.filter(item => item.lesson_type === 'quiz');
          const totalCompleted = response.data.filter(item => item.status === 'completed').length;
          const totalLessons = lessons.length;
          const totalQuizzes = quizzes.length;
          setProgressData({
            lessons,
            quizzes,
            overview: {
              total_completed: totalCompleted,
              total_in_progress: response.data.filter(item => item.status === 'in_progress').length,
              total_lessons: totalLessons,
              total_quizzes: totalQuizzes,
            },
          });
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  };

  const getProgressColor = (percent) => {
    if (percent === 100) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const overallProgress = (
    ((progressData.overview.total_completed) /
      (progressData.overview.total_lessons + progressData.overview.total_quizzes || 1)) *
    100
  ).toFixed(1);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-8">
      <Navbar/>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center">
              <TrendingUp className="w-6 h-6 mr-2" /> Tiến độ Học tập
            </h1>
            <button
              onClick={() => navigate('/progress/path')}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50"
            >
              Xem Lộ trình
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tổng quan</h2>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Tiến độ tổng: {overallProgress}%</span>
              <span className="text-sm text-gray-600">
                {progressData.overview.total_completed}/{progressData.overview.total_lessons + progressData.overview.total_quizzes} đã hoàn thành
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getProgressColor(overallProgress)}`}
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Bài học</p>
              <p className="text-lg font-bold text-gray-900">
                {progressData.lessons.filter(l => l.status === 'completed').length}/{progressData.overview.total_lessons}
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600">Bài kiểm tra</p>
              <p className="text-lg font-bold text-gray-900">
                {progressData.quizzes.filter(q => q.status === 'completed').length}/{progressData.overview.total_quizzes}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600" /> Hoạt động Gần đây
          </h2>
          <div className="space-y-4">
            {[...progressData.lessons, ...progressData.quizzes].map(item => (
              <div key={item.progress_id} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-center space-x-4">
                  {item.lesson_type === 'quiz' ? (
                    <FileText className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(item.last_accessed_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {item.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                  </p>
                  {item.score && <p className="text-xs text-gray-500">Điểm: {item.score}%</p>}
                  <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full ${getProgressColor(item.progress_percent)}`}
                      style={{ width: `${item.progress_percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default LearningProgress;