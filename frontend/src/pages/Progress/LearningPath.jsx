import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  BookOpen,
  FileText,
  CheckCircle,
  ArrowLeft,
  Target,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Star,
  Award
} from 'lucide-react';
import { useUserStore } from '../../store/userSlice';
import { getLearningPathsByUserId, generateRecommendedPath, getSkillRecommendations } from '../../models/learningPath.model';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const LearningPath = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();
  const [learningPath, setLearningPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [generatingRecommendation, setGeneratingRecommendation] = useState(false);
  const limit = 10;

  // Lấy recommendedSkill từ state nếu có
  const recommendedSkill = location.state?.recommendedSkill;

  const fetchLearningPath = async () => {
    if (!user?.user_id) {
      setError('Vui lòng đăng nhập để xem lộ trình học tập');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching learning paths for userId:', user.user_id);
      const response = await getLearningPathsByUserId(user.user_id, limit, page * limit);
      console.log('API Response:', response);

      if (response.status === 'success') {
        setLearningPath(
          response.data.map((path) => ({
            step_id: path.path_id,
            type: path.lesson_type || 'lesson',
            lesson_id: path.lesson_id || path.path_id,
            title: path.path_title || 'Lộ trình không có tiêu đề',
            description: path.description || 'Không có mô tả',
            difficulty: path.difficulty || 'beginner',
            status: path.status || 'not_started',
            progress_percent: Number(path.progress_percent) || 0,
            estimated_time: path.estimated_time || '15 phút',
            skill_type: path.skill_type || 'general'
          }))
        );
      } else {
        setError(response.message || 'Không thể lấy lộ trình học tập');
        toast.error(response.message || 'Không thể lấy lộ trình học tập');
      }
    } catch (err) {
      console.error('Fetch Error:', err.message, err.response?.data);
      setError(err.message || 'Lỗi khi lấy lộ trình học tập');
      toast.error(err.message || 'Lỗi khi lấy lộ trình học tập');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLearningPath();
  }, [user, page]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLearningPath();
  };

  const handleGenerateRecommendation = async () => {
    if (!user?.user_id) return;

    setGeneratingRecommendation(true);
    try {
      const response = await generateRecommendedPath(user.user_id);
      if (response.status === 'success') {
        setRecommendations(response.data);
        toast.success('Đã tạo lộ trình gợi ý thành công!');
      } else {
        toast.error(response.message || 'Không thể tạo lộ trình gợi ý');
      }
    } catch (err) {
      console.error('Generate recommendation error:', err);
      toast.error(err.message || 'Lỗi khi tạo lộ trình gợi ý');
    } finally {
      setGeneratingRecommendation(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'not_started':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-50';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50';
      case 'advanced':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung cấp';
      case 'advanced':
        return 'Nâng cao';
      default:
        return difficulty;
    }
  };

  const getSkillIcon = (skillType) => {
    switch (skillType) {
      case 'listening':
        return <BookOpen className="w-5 h-5 text-yellow-600" />;
      case 'speaking':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'reading':
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      case 'writing':
        return <FileText className="w-5 h-5 text-teal-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-blue-600" />;
    }
  };

  const handleStart = (item) => {
    if (item.type === 'lesson') {
      // Điều hướng dựa trên skill_type
      if (item.skill_type && item.skill_type !== 'general') {
        navigate(`/${item.skill_type}/${item.lesson_id}`);
      } else {
        navigate(`/lessons/${item.lesson_id}`);
      }
    } else {
      navigate(`/tests/${item.lesson_id}`);
    }
    toast.info(`Bắt đầu ${item.title}`);
    console.log(`Cập nhật learningprogress: lesson_id=${item.lesson_id}, status=in_progress`);
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
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={handleRefresh}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Thử lại
                </button>
                {error.includes('đăng nhập') ? (
                  <button
                    onClick={() => navigate('/auth/login')}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Đăng nhập lại
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/progress')}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Quay lại
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/progress')}
                className="flex items-center p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Target className="w-8 h-8" />
                  Lộ trình Học tập
                </h1>
                <p className="text-blue-100 mt-1">Khám phá con đường học tiếng Anh của bạn</p>
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 flex items-center gap-1 text-sm"
              >
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Skill Banner */}
        {recommendedSkill && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">Gợi ý cải thiện</h3>
                <p className="text-yellow-700 text-sm">
                  Tập trung vào kỹ năng <strong>{recommendedSkill}</strong> để cải thiện điểm số của bạn
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendation Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Lộ trình học tập thông minh</h3>
            </div>
            <button
              onClick={handleGenerateRecommendation}
              disabled={generatingRecommendation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {generatingRecommendation ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Tạo lộ trình gợi ý
                </>
              )}
            </button>
          </div>
          <p className="text-blue-700 text-sm">
            Hệ thống sẽ phân tích điểm mạnh yếu của bạn và tạo lộ trình học tập phù hợp nhất
          </p>
        </div>

        {/* AI Recommendations Display */}
        {recommendations && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Lộ trình được gợi ý</h3>
            </div>

            {/* Analysis Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Phân tích kỹ năng:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {recommendations.analysis?.prioritySkills?.map((skill, index) => (
                  <div key={index} className="bg-white rounded p-3 border">
                    <div className="font-medium text-sm capitalize">{skill.skill}</div>
                    <div className="text-xs text-gray-600">Điểm: {skill.score.toFixed(1)}/10</div>
                    <div className="text-xs text-blue-600">Ưu tiên: {skill.priority}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Steps */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Các bước học tập:</h4>
              {recommendations.steps?.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          Bước {step.step_id}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${step.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          step.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {step.difficulty === 'beginner' ? 'Cơ bản' :
                            step.difficulty === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
                        </span>
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">{step.title}</h5>
                      <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                      <p className="text-xs text-blue-600">{step.recommendation}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{step.estimated_time}</div>
                      <button
                        onClick={() => handleStart(step)}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Bắt đầu
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Path Timeline */}
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 to-purple-200"></div>

          {learningPath.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lộ trình học tập</h3>
              <p className="text-gray-600 mb-4">Hãy bắt đầu với bài học đầu tiên để tạo lộ trình học tập cá nhân</p>
              <button
                onClick={() => navigate('/skills')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Khám phá kỹ năng
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {learningPath.map((step, index) => (
                <div key={step.step_id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-6 top-6 w-4 h-4 rounded-full border-4 border-white shadow-lg z-10">
                    <div
                      className={`w-full h-full rounded-full ${step.status === 'completed'
                        ? 'bg-green-500'
                        : step.status === 'in_progress'
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                        }`}
                    ></div>
                  </div>

                  {/* Content card */}
                  <div className="ml-12 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getSkillIcon(step.skill_type)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(step.status)}`}>
                              {step.status === 'completed' ? 'Hoàn thành' :
                                step.status === 'in_progress' ? 'Đang học' : 'Chưa bắt đầu'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(step.difficulty)}`}>
                              {getDifficultyLabel(step.difficulty)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {step.status === 'completed' && (
                        <Award className="w-6 h-6 text-green-600" />
                      )}
                    </div>

                    <p className="text-gray-600 mb-4">{step.description}</p>

                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{step.estimated_time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{step.progress_percent}% hoàn thành</span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}
                        style={{ width: `${step.progress_percent}%` }}
                      ></div>
                    </div>

                    <button
                      onClick={() => handleStart(step)}
                      disabled={step.status === 'completed'}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${step.status === 'completed'
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : step.status === 'in_progress'
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      {step.status === 'completed' ? 'Đã hoàn thành' :
                        step.status === 'in_progress' ? 'Tiếp tục học' : 'Bắt đầu học'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {learningPath.length > 0 && (
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Trang trước
            </button>
            <span className="text-gray-600">Trang {page + 1}</span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={learningPath.length < limit}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Trang sau
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default LearningPath;