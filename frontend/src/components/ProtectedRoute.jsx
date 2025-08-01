import { Navigate, Outlet } from 'react-router-dom';
import { getUser } from '../services/token';

export default function ProtectedRoute({ roles = [] }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}