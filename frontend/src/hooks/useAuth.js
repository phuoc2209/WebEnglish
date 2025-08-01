import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as AuthModel from '../models/auth.model';
import { useUserStore } from '../store/userSlice';
import { toast } from 'react-toastify';



export const useAuth = () => {
  const { user, token, login: setUser, logout: clearUser } = useUserStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthModel.login({ email, password });
      console.log('Login response:', response);
      if (response.status.success) {
        const { user, token } = JSON.parse(response.data);
        setUser(user, token);
        toast.success('Đăng nhập thành công!');
        navigate('/', { replace: true });
        return { success: true, message: response.status.message };
      } else {
        setError(response.status.message);
        toast.error(response.status.message);
        return { success: false, message: response.status.message };
      }
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.status?.message || 'Đăng nhập thất bại';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthModel.register({ username, email, password });
      if (response.status?.success) {
        // Đăng nhập tự động sau khi đăng ký thành công
        await login(email, password);
        return { success: true, message: 'Đăng ký thành công' };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || 'Đăng ký thất bại';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await AuthModel.logout();
      clearUser();
      navigate('/auth/login');
      return { success: true, message: 'Đăng xuất thành công' };
    } catch (err) {
      const message = err.message || 'Đăng xuất thất bại';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthModel.forgotPassword(email);
      if (response.status === 'success') {
        return { success: true, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || 'Gửi yêu cầu thất bại';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthModel.resetPassword(token, password);
      if (response.status === 'success') {
        return { success: true, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || 'Đặt lại mật khẩu thất bại';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const verifyResetToken = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthModel.verifyResetToken(token);
      if (response.status === 'success') {
        return { success: true, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || 'Token không hợp lệ';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    user,
    token,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyResetToken,
    loading,
    error,
    clearError,
  };
};