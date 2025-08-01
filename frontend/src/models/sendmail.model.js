import api from '../services/api';

/**
 * Gửi OTP về email khi đăng ký tài khoản mới
 * @param {string} email
 * @returns {Promise<{message: string}>}
 */
export async function sendOtpRegister(email) {
    try {
        const response = await api.post('/sendmail/register', { email });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể gửi mã xác thực qua email');
    }
}

/**
 * Xác thực OTP khi đăng ký tài khoản mới
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<{message: string}>}
 */
export async function verifyOtpRegister(email, otp) {
    try {
        const response = await api.post('/sendmail/verify-otp', { email, otp });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Xác thực OTP thất bại');
    }
}

/**
 * Gửi OTP quên mật khẩu
 * @param {string} email
 * @returns {Promise<{message: string}>}
 */
export async function sendForgotPasswordOtp(email) {
    try {
        const response = await api.post('/sendmail/forgot-password-otp', { email });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể gửi mã OTP quên mật khẩu');
    }
}

/**
 * Xác thực OTP quên mật khẩu
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<{message: string}>}
 */
export async function verifyForgotPasswordOtp(email, otp) {
    try {
        const response = await api.post('/sendmail/verify-forgot-otp', { email, otp });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Xác thực OTP quên mật khẩu thất bại');
    }
}

