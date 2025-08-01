import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { sendForgotPasswordOtp, verifyForgotPasswordOtp } from '../../models/sendmail.model';
import { updatePasswordByOtp } from '../../models/auth.model';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập otp, 3: nhập mật khẩu mới
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Bước 1: Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    try {
      await sendForgotPasswordOtp(email);
      toast.success('Mã OTP đã được gửi về email.');
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Không thể gửi mã OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    try {
      await verifyForgotPasswordOtp(email, otp);
      toast.success('Xác thực OTP thành công!');
      setStep(3);
    } catch (err) {
      toast.error(err.message || 'Xác thực OTP thất bại');
    } finally {
      setOtpLoading(false);
    }
  };

  // Bước 3: Đặt lại mật khẩu mới
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Mật khẩu không khớp');
      return;
    }
    setLoading(true);
    try {
      await updatePasswordByOtp(email, password);
      toast.success('Đặt lại mật khẩu thành công!');
      setTimeout(() => navigate('/auth/login'), 2000);
    } catch (err) {
      toast.error(err.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-lg transform transition-all hover:shadow-xl">
        {step === 1 && (
          <>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
                  <Mail className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Quên mật khẩu</h2>
              <p className="mt-2 text-sm text-gray-600">
                Nhập email đăng ký để nhận mã OTP đặt lại mật khẩu.
              </p>
            </div>
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email đăng ký
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                    placeholder="Nhập email của bạn"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={otpLoading}
                className="w-full flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang gửi mã...
                  </>
                ) : (
                  'Gửi mã OTP'
                )}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              Đã nhớ mật khẩu?{' '}
              <Link
                to="/auth/login"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
              >
                Quay lại đăng nhập
              </Link>
            </p>
          </>
        )}
        {step === 2 && (
          <>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-400 to-pink-500 p-3 rounded-full">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Xác thực OTP</h2>
              <p className="text-gray-600 mb-6 text-base">
                Nhập mã OTP đã gửi về email <span className="font-semibold text-blue-700">{email}</span> để tiếp tục.<br />
                <span className="text-xs text-gray-400">(Kiểm tra cả hộp thư spam nếu không thấy email)</span>
              </p>
            </div>
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
                  'Xác thực OTP'
                )}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              Không nhận được mã?{' '}
              <button type="button" className="text-blue-600 hover:text-blue-800 font-semibold underline" onClick={handleSendOtp}>
                Gửi lại mã
              </button>
            </p>
          </>
        )}
        {step === 3 && (
          <>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Đặt lại mật khẩu mới</h2>
              <p className="text-gray-600 mb-6">
                Nhập mật khẩu mới cho tài khoản <span className="font-medium text-blue-600">{email}</span>.
              </p>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  'Lưu mật khẩu mới'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}