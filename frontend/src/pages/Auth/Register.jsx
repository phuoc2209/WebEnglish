import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, KeyRound } from 'lucide-react';
import { toast } from 'react-toastify';
import { requestRegisterOtp, confirmRegisterOtp } from '../../controllers/sendmail.controller';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu không khớp');
      return;
    }
    try {
      setOtpLoading(true);
      await requestRegisterOtp(formData.email);
      setOtpStep(true);
      toast.info('Mã xác thực đã được gửi về email. Vui lòng kiểm tra và nhập mã OTP.');
    } catch (err) {
      toast.error(err.message || 'Không thể gửi mã xác thực qua email');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Vui lòng nhập mã OTP');
      return;
    }
    setOtpLoading(true);
    try {
      await confirmRegisterOtp(formData.email, otp);
      const result = await register(formData.username, formData.email, formData.password);
      if (result.success) {
        setSuccess(true);
        toast.success('Đăng ký thành công! Bạn đã được đăng nhập tự động.');
        navigate('/');
      } else {
        toast.error(result.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      toast.error(err.message || 'Xác thực OTP thất bại');
    } finally {
      setOtpLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-4">
        <div className="max-w-md w-full p-8 bg-white/90 rounded-3xl shadow-2xl text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-full shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Đăng ký thành công!</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Bạn đã được đăng nhập tự động. Bắt đầu khám phá ngay!
          </p>
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold text-lg transition-colors duration-300"
          >
            Vào trang chủ
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Link>
        </div>
      </div>
    );
  }

  if (otpStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-4">
        <div className="max-w-md w-full p-8 bg-white/90 rounded-3xl shadow-2xl text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-pink-500 p-4 rounded-full shadow-lg">
              <KeyRound className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Xác thực Email</h2>
          <p className="text-gray-600 mb-6 text-base">
            Vui lòng nhập mã xác thực (OTP) đã gửi về email <span className="font-semibold text-blue-700">{formData.email}</span> để hoàn tất đăng ký.<br />
            <span className="text-xs text-gray-400">(Kiểm tra cả hộp thư spam nếu không thấy email)</span>
          </p>
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className="w-full px-6 py-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center text-2xl tracking-widest font-mono bg-blue-50 placeholder-gray-400 outline-none transition-all"
              placeholder="Nhập mã OTP"
              disabled={otpLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={otpLoading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {otpLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang xác thực...
                </>
              ) : (
                'Xác thực'
              )}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Không nhận được mã? <button type="button" className="text-blue-600 hover:text-blue-800 font-semibold underline" onClick={async () => {
              setOtpLoading(true);
              try {
                await requestRegisterOtp(formData.email);
                toast.info('Đã gửi lại mã xác thực qua email.');
              } catch (err) {
                toast.error(err.message || 'Không thể gửi lại mã xác thực');
              } finally {
                setOtpLoading(false);
              }
            }}>Gửi lại mã</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-white/90 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Đăng ký tài khoản</h2>
          <p className="mt-2 text-base text-gray-600">
            Tạo tài khoản mới để bắt đầu hành trình học tập của bạn!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-xl flex items-center text-base">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-base font-medium text-gray-700 mb-2">
              Tên người dùng
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full pl-14 pr-4 py-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-lg bg-blue-50 outline-none"
                placeholder="Nhập tên người dùng"
                autoFocus
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-14 pr-4 py-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-lg bg-blue-50 outline-none"
                placeholder="Nhập email của bạn"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-14 pr-12 py-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-lg bg-blue-50 outline-none"
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-14 pr-12 py-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-lg bg-blue-50 outline-none"
                placeholder="Xác nhận mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otpLoading}
            className="w-full flex items-center justify-center py-4 px-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(loading || otpLoading) ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Đang gửi mã xác thực...
              </>
            ) : (
              'Đăng ký'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-8 text-center text-base text-gray-600">
          Đã có tài khoản?{' '}
          <Link
            to="/auth/login"
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}