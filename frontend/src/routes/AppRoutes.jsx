import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userSlice';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
import HomePage from '../pages/Home/HomePage';
import Listening from '../pages/Skills/Listening';
import ListeningExercise from '../pages/Skills/ListeningExercise';
import Speaking from '../pages/Skills/Speaking';
import SpeakingExercise from '../pages/Skills/SpeakingExercise';
import Reading from '../pages/Skills/Reading';
import ReadingExercise from '../pages/Skills/ReadingExercise';
import Writting from '../pages/Skills/Writting';
import WrittingExercise from '../pages/Skills/WrittingExercise';
import GrammarList from '../pages/Grammar/GrammarList';
import GrammarDetail from '../pages/Grammar/GrammarDetail';
import VocabularyDetail from '../pages/Vocabulary/VocabularyDetail';
import VocabularyList from '../pages/Vocabulary/VocabularyList';
import ProfilePage from '../pages/Profile/ProfilePage';
import EditProfile from '../pages/Profile/EditProfile';
import TestList from '../pages/Tests/TestList';
import Test from '../pages/Tests/Test';
import TestResult from '../pages/Tests/TestResult';
import PostDetail from '../pages/Community/PostDetail';
import CreatePost from '../pages/Community/CreatePost';
import CommunityFeed from '../pages/Community/CommunityFeed';
import SkillAnalysis from '../pages/Strength/SkillAnalysis';
import LearningPath from '../pages/Progress/LearningPath';
import LearningProgress from '../pages/Progress/LearningProgress';
import GameList from '../pages/Games/GameList';
import GamePlay from '../pages/Games/GamePlay';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import UserManagement from '../pages/Admin/UserManagement';
import CommunityManagement from '../pages/Admin/CommunityManagement';
import LessonManagement from '../pages/Admin/LessonManagement';
import QuizManagement from '../pages/Admin/QuizManagement';
import TransactionManagement from '../pages/Admin/TransactionManagement';
import ServiceManagement from '../pages/Admin/ServiceManagement';


// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user } = useUserStore();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect to home if already logged in)
const PublicRoute = ({ children }) => {
  const { user } = useUserStore();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes - Chỉ hiển thị khi chưa đăng nhập */}
      <Route element={<AuthLayout />}>
        <Route
          path="/auth/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
      </Route>

      {/* Protected routes - Chỉ hiển thị khi đã đăng nhập */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />

        {/* Skills routes */}
        <Route path="/listening" element={<Listening />} />
        <Route path="/listening/:skillId" element={<ListeningExercise />} />
        <Route path="/speaking" element={<Speaking />} />
        <Route path="/speaking/:skillId" element={<SpeakingExercise />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/reading/:skillId" element={<ReadingExercise />} />
        <Route path="/writting" element={<Writting />} />
        <Route path="/writting/:skillId" element={<WrittingExercise />} />

        {/* Lessons routes */}
        <Route path="/grammar" element={<GrammarList />} />
        <Route path="/grammar/:grammarId" element={<GrammarDetail />} />
        <Route path="/vocabulary" element={<VocabularyList />} />
        <Route path="/vocabulary/:vocabId" element={<VocabularyDetail />} />

        {/* Profile routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfile />} />

        {/* Tests routes */}
        <Route path="/tests" element={<TestList />} />
        <Route path="/tests/:quizId" element={<Test />} />
        <Route path="/tests/:quizId/result" element={<TestResult />} />

        {/* Community routes */}
        <Route path="/community" element={<CommunityFeed />} />
        <Route path="/community/create" element={<CreatePost />} />
        <Route path="/community/:postId" element={<PostDetail />} />


        {/* Strength routes */}
        <Route path="/strength" element={<SkillAnalysis />} />

        {/* Progress routes */}
        <Route path="/progress" element={<LearningProgress />} />
        <Route path="/progress/path" element={<LearningPath />} />

        {/* Games routes */}
        <Route path="/games" element={<GameList />} />
        <Route path="/games/:gameId/play" element={<GamePlay />} />
      </Route>

      {/* Admin routes - Chỉ hiển thị khi đã đăng nhập và là admin */}
      <Route
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/community" element={<CommunityManagement />} />
        <Route path="/admin/lessons" element={<LessonManagement />} />
        <Route path="/admin/quizzes" element={<QuizManagement />} />
        <Route path="/admin/transactions" element={<TransactionManagement />} />
        <Route path="/admin/services" element={<ServiceManagement />} />
      </Route>

      {/* Redirect root to login if not authenticated */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;