import { useUserStore } from '../../store/userSlice';
import Button from '../../components/Button';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Users, Trophy, Play, Target, ArrowRight, Star, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useEffect, useState } from 'react';
import { getAllServicePackages } from '../../models/service.model';

const HomePage = () => {
  const { user } = useUserStore();
  const isAuthenticated = !!user; // Kiểm tra xác thực dựa trên user
  const navigate = useNavigate();
  const [servicePackages, setServicePackages] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [errorServices, setErrorServices] = useState(null);

  const handleLoginRedirect = () => {
    navigate('/auth/login');
  };

  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-blue-600" />,
      title: "Comprehensive Lessons",
      description: "Học ngữ pháp, từ vựng và nâng cao cả bốn kỹ năng ngôn ngữ.",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Community Learning",
      description: "Kết nối với những người học khác và chia sẻ quá trình học tập của bạn.",
      color: "bg-green-50 border-green-200"
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-600" />,
      title: "Achievements",
      description: "Nhận huy hiệu và theo dõi các cột mốc học tập của bạn.",
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      icon: <Play className="w-8 h-8 text-purple-600" />,
      title: "Interactive Games",
      description: "Biến việc học trở nên thú vị với các trò chơi giáo dục hấp dẫn.",
      color: "bg-purple-50 border-purple-200"
    }
  ];

  const skillTypes = [
    { name: 'Listening', icon: '🎧', path: '/skills/listening', color: 'bg-blue-500' },
    { name: 'Speaking', icon: '🗣️', path: '/skills/speaking', color: 'bg-green-500' },
    { name: 'Reading', icon: '📖', path: '/skills/reading', color: 'bg-yellow-500' },
    { name: 'Writing', icon: '✍️', path: '/skills/writing', color: 'bg-purple-500' }
  ];

  const mockStats = {
    vocabularyLessons: 120,
    grammarLessons: 85,
    games: 45,
    users: 1000
  };

  const mockLessons = [
    {
      id: 1,
      title: "Essential Business Vocabulary",
      content: "Master important business terms and professional communication skills..."
    },
    {
      id: 2,
      title: "Daily Conversation Basics",
      content: "Learn everyday phrases and expressions for natural conversations..."
    },
    {
      id: 3,
      title: "Advanced Grammar Structures",
      content: "Dive deep into complex grammar patterns and sentence structures..."
    }
  ];

  const mockGames = [
    {
      id: 1,
      title: "Word Master Challenge",
      description: "Test your vocabulary with this exciting word puzzle game"
    },
    {
      id: 2,
      title: "Grammar Quest",
      description: "Adventure through grammar rules in this interactive quest"
    },
    {
      id: 3,
      title: "Pronunciation Practice",
      description: "Perfect your pronunciation with AI-powered feedback"
    }
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await getAllServicePackages();
        if (res.status === 'success') {
          setServicePackages(res.data);
        } else {
          setErrorServices(res.message || 'Không thể lấy danh sách gói dịch vụ');
        }
      } catch (err) {
        setErrorServices(err.message || 'Lỗi kết nối đến máy chủ');
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {isAuthenticated ? (
                <>
                  Chào mừng,
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    {user?.username || user?.email?.split('@')[0]}!
                  </span>
                </>
              ) : (
                <>
                  Master English with
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    Interactive Learning
                  </span>
                </>
              )}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {isAuthenticated ? (
                "Tiếp tục hành trình học tiếng Anh của bạn với các bài học cá nhân hóa, trò chơi tương tác và sự hỗ trợ từ cộng đồng."
              ) : (
                "Join thousands of learners improving their English skills through personalized lessons, interactive games, and community support."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/vocabulary"
                    className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Tiếp tục học
                  </Link>
                  <Link
                    to="/games"
                    className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Chơi game
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleLoginRedirect}
                    className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Start Learning Free
                  </Button>
                  <Link
                    to="/vocabulary"
                    className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Explore Lessons
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-40 right-20 animate-pulse">
          <div className="w-6 h-6 bg-pink-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-bounce delay-1000">
          <div className="w-3 h-3 bg-green-400 rounded-full opacity-60"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {mockStats.vocabularyLessons}+
              </div>
              <div className="text-gray-600">Vocabulary Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                {mockStats.grammarLessons}+
              </div>
              <div className="text-gray-600">Grammar Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                {mockStats.games}+
              </div>
              <div className="text-gray-600">Interactive Games</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-600 mb-2">
                {mockStats.users}+
              </div>
              <div className="text-gray-600">Active Learners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn nền tảng của chúng tôi?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá những tính năng giúp việc học tiếng Anh trở nên hiệu quả và thú vị.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border-2 ${feature.color} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Thành thạo cả bốn kỹ năng.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Phát triển khả năng sử dụng tiếng Anh toàn diện thông qua việc luyện tập từng kỹ năng một cách có trọng tâm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillTypes.map((skill, index) => (
              <Link
                key={index}
                to={skill.path}
                className="group p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 ${skill.color} rounded-2xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {skill.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {skill.name}
                </h3>
                <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                  <span className="text-sm font-medium">Practice Now</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Featured Lessons */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                Popular Lessons
              </h2>
              <div className="space-y-4">
                {mockLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {lesson.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {lesson.content?.substring(0, 100)}...
                        </p>
                        <div className="flex items-center text-sm text-blue-600">
                          <Star className="w-4 h-4 mr-1" />
                          <span>Popular</span>
                        </div>
                      </div>
                      <Link
                        to={`/vocabulary/${lesson.id}`}
                        className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center text-sm"
                      >
                        Start
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  to="/vocabulary"
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  View All Lessons
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

            {/* Featured Games */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <Play className="w-8 h-8 text-purple-600 mr-3" />
                Popular Games
              </h2>
              <div className="space-y-4">
                {mockGames.map((game) => (
                  <div
                    key={game.id}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {game.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {game.description}
                        </p>
                        <div className="flex items-center text-sm text-purple-600">
                          <Target className="w-4 h-4 mr-1" />
                          <span>Interactive</span>
                        </div>
                      </div>
                      <Link
                        to={`/games/${game.id}`}
                        className="ml-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300 flex items-center text-sm"
                      >
                        Play
                        <Play className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  to="/games"
                  className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                >
                  View All Games
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {isAuthenticated ? "Tiếp tục học hỏi và phát triển!" : "Ready to Start Your English Journey?"}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {isAuthenticated ? (
              "Tiếp tục nâng cao kỹ năng tiếng Anh của bạn với nền tảng học tập toàn diện của chúng tôi và tham gia vào cộng đồng ngày càng phát triển."
            ) : (
              "Join our community of learners and take your English skills to the next level with personalized lessons and interactive content."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link
                  to="/vocabulary"
                  className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Tiếp tục học
                </Link>
                <Link
                  to="/games"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Chơi game
                </Link>
              </>
            ) : (
              <>
                <Button
                  onClick={handleLoginRedirect}
                  className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
                <Link
                  to="/vocabulary"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
                >
                  Explore Lessons
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;