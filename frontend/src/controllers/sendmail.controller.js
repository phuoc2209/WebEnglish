import { sendOtpRegister, verifyOtpRegister } from '../models/sendmail.model';

/**
 * Gửi OTP về email khi đăng ký tài khoản mới
 * @param {string} email
 * @returns {Promise<{message: string}>}
 */
export async function requestRegisterOtp(email) {
    return await sendOtpRegister(email);
}

/**
 * Xác thực OTP khi đăng ký tài khoản mới
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<{message: string}>}
 */
export async function confirmRegisterOtp(email, otp) {
    return await verifyOtpRegister(email, otp);
}



