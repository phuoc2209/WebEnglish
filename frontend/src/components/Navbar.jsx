import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userSlice';
import { User, LogOut, ChevronDown, ChevronUp, TrendingUp, BarChart2, Settings } from 'lucide-react';
import { getUserById } from '../models/user.model';

const Navbar = () => {
  const { user, clearUser, updateUser } = useUserStore();
  const navigate = useNavigate();
  //const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user profile data including avatar
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.user_id) return;

      setLoading(true);
      try {
        const response = await getUserById(user.user_id);
        if (response.status === 'success' && response.data) {
          setUserProfile(response.data);

          // Update user store with latest avatar_url and full_name if they changed
          const newAvatarUrl = response.data.profiles?.avatar_url || null;
          const newFullName = response.data.profiles?.full_name || user.username;

          if (newAvatarUrl !== user.avatar_url || newFullName !== user.full_name) {
            updateUser({
              avatar_url: newAvatarUrl,
              full_name: newFullName
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.user_id]); // Remove updateUser and location.search from dependencies

  const handleLogout = () => {
    clearUser();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/login');
    setIsProfileOpen(false);
  };

  // Hàm lấy chữ cái đầu tiên để làm fallback
  const getAvatarInitial = () => {
    if (userProfile?.profiles?.full_name) {
      return userProfile.profiles.full_name.charAt(0).toUpperCase();
    }
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Hàm render avatar (cho desktop)
  const renderAvatar = () => {
    const avatarUrl = userProfile?.profiles?.avatar_url || user?.avatar_url;

    // Chỉ render img nếu có avatarUrl hợp lệ
    if (avatarUrl && avatarUrl.trim() !== "" && avatarUrl !== null && avatarUrl !== undefined) {
      return (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          onError={(e) => {
            // Fallback to initial if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }

    // Fallback to initial avatar
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
        {getAvatarInitial()}
      </div>
    );
  };

  // Hàm render avatar (cho mobile)
  const renderMobileAvatar = () => {
    const avatarUrl = userProfile?.profiles?.avatar_url || user?.avatar_url;

    // Chỉ render img nếu có avatarUrl hợp lệ
    if (avatarUrl && avatarUrl.trim() !== "" && avatarUrl !== null && avatarUrl !== undefined) {
      return (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
          onError={(e) => {
            // Fallback to initial if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }

    // Fallback to initial avatar
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
        {getAvatarInitial()}
      </div>
    );
  };

  // Hàm lấy tên hiển thị
  const getDisplayName = () => {
    return userProfile?.profiles?.full_name || user?.full_name || user?.username || user?.email?.split('@')[0] || 'User';
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">English Learning</h1>
            </Link>
          </div>

          {/* Menu cho desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/grammar"
              className="px-3 py-2 text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Ngữ pháp
            </Link>
            <Link
              to="/vocabulary"
              className="px-3 py-2 text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Từ vựng
            </Link>
            <div className="relative overflow-visible group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition font-medium">
                <span>Kỹ năng</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-40"
                style={{ paddingTop: '10px', marginTop: '-2px' }}
              >
                <Link
                  to="/listening"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kỹ năng nghe
                </Link>
                <Link
                  to="/speaking"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kỹ năng nói
                </Link>
                <Link
                  to="/reading"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kỹ năng đọc
                </Link>
                <Link
                  to="/writting"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kỹ năng viết
                </Link>
              </div>
            </div>
            <div className="relative overflow-visible group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition font-medium">
                <span>Cộng đồng</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-40"
                style={{ paddingTop: '10px', marginTop: '-2px' }}
              >
                <Link
                  to="/community"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cộng đồng chung
                </Link>
              </div>
            </div>
            <Link
              to="/tests"
              className="px-3 py-2 text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Kiểm tra
            </Link>
            <Link
              to="/games"
              className="px-3 py-2 text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Trò chơi
            </Link>
          </div>

          {/* Phần bên phải (đăng nhập/avatar) */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                {/* Avatar button */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                  disabled={loading}
                >
                  {renderAvatar()}
                  <span className="hidden md:inline text-gray-700 font-medium">
                    {getDisplayName()}
                  </span>
                  {isProfileOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 hidden md:block" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                  )}
                </button>

                {/* Profile dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Hồ sơ cá nhân
                      </div>
                    </Link>
                    <Link
                      to="/strength"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="flex items-center">
                        <BarChart2 className="w-4 h-4 mr-2" />
                        Phân tích kỹ năng
                      </div>
                    </Link>
                    <Link
                      to="/progress"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Tiến độ học tập
                      </div>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          Quản lý hệ thống
                        </div>
                      </Link>
                    )}
                    {user?.role === 'moderator' && (
                      <Link
                        to="/moderator/dashboard"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          Bảng điều khiển Moderator
                        </div>
                      </Link>
                    )}
                    {user?.role === 'teacher' && (
                      <Link
                        to="/teacher/dashboard"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          Bảng điều khiển Giáo viên
                        </div>
                      </Link>
                    )}
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Đăng xuất
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 transition font-medium"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200/50">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              to="/grammar"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100/80 rounded-md font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Ngữ pháp
            </Link>
            <Link
              to="/vocabulary"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100/80 rounded-md font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Từ vựng
            </Link>
            <Link
              to="/forums"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100/80 rounded-md font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Diễn đàn
            </Link>
            <Link
              to="/skills"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100/80 rounded-md font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Kỹ năng
            </Link>
            <Link
              to="/community"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100/80 rounded-md font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Cộng đồng
            </Link>

            {!user && (
              <div className="pt-4 border-t border-gray-200/50 space-y-2">
                <Link
                  to="/auth/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100/80 rounded-md font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/auth/register"
                  className="block px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {user && (
              <div className="pt-4 border-t border-gray-200/50 space-y-2">
                <div className="flex items-center px-3 py-2">
                  {renderMobileAvatar()}
                  <span className="text-gray-700 font-medium ml-2">
                    {getDisplayName()}
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100/80 rounded-md font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hồ sơ cá nhân
                </Link>
                <Link
                  to="/strength"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100/80 rounded-md font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Phân tích kỹ năng
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100/80 rounded-md font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Quản lý hệ thống
                  </Link>
                )}
                {user?.role === 'moderator' && (
                  <Link
                    to="/moderator/dashboard"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100/80 rounded-md font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Bảng điều khiển Moderator
                  </Link>
                )}
                {user?.role === 'teacher' && (
                  <Link
                    to="/teacher/dashboard"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100/80 rounded-md font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Bảng điều khiển Giáo viên
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;