import { Outlet, NavLink } from 'react-router-dom';
import { useUserStore } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, MessageCircle, BookOpen, CreditCard, Crown, FileText } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      icon: BarChart3
    },
    {
      path: '/admin/users',
      name: 'Quản lý người dùng',
      icon: Users
    },
    {
      path: '/admin/community',
      name: 'Quản lý cộng đồng',
      icon: MessageCircle
    },
    {
      path: '/admin/lessons',
      name: 'Quản lý bài học',
      icon: BookOpen
    },
    {
      path: '/admin/quizzes',
      name: 'Quản lý Quiz',
      icon: FileText
    },
    {
      path: '/admin/transactions',
      name: 'Quản lý giao dịch',
      icon: CreditCard
    },
    {
      path: '/admin/services',
      name: 'Quản lý gói dịch vụ',
      icon: Crown
    },
    {
      path: '/admin/forums',
      name: 'Quản lý diễn đàn',
      icon: Crown
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 bg-blue-600">
          <h1 className="text-white text-xl font-bold">Admin Panel</h1>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;