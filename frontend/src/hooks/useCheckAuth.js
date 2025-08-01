
import { useEffect } from 'react';
import { useUserStore } from '../store/userSlice';
import { AuthController } from '../controllers/auth.controller';
import { getToken } from '../services/token';

export const useCheckAuth = () => {
  const { login: setUser, logout: clearUser } = useUserStore();

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const token = getToken();
      console.log('Token:', token);
      if (!token) {
        clearUser();
        return;
      }
      const response = await AuthController.getCurrentUser();
      console.log('GetCurrentUser response:', response);
      if (response.status.success && response.data) {
        const user = JSON.parse(response.data);
        console.log('Parsed user:', user);
        setUser(user, token);
      } else {
        clearUser();
      }
    } catch (error) {
      console.error('CheckAuth Error:', error.message);
      clearUser();
    }
  };
  checkAuth();
}, [setUser, clearUser]);

  // Return function để force check lại auth khi cần
  return {
    recheckAuth: async () => {
      try {
        const token = getToken();
        if (!token) {
          clearUser();
          return false;
        }

        const response = await AuthController.getCurrentUser();
        if (response.status === 'success' && response.data.user) {
          setUser(response.data.user, token);
          return true;
        } else {
          clearUser();
          return false;
        }
      } catch (error) {
        console.log('Không thể xác thực người dùng:', error.message);
        clearUser();
        return false;
      }
    },
  };
};
