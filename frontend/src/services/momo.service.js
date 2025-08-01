import api from './api';

/**
 * Service xử lý thanh toán MoMo ở frontend
 */
class MomoService {
    /**
     * Tạo thanh toán MoMo
     * @param {Object} paymentData - Dữ liệu thanh toán
     * @param {number} paymentData.userId - ID người dùng
     * @param {number} paymentData.packageId - ID gói dịch vụ
     * @param {number} paymentData.amount - Số tiền
     * @returns {Promise<Object>} - Kết quả tạo thanh toán
     */
    static async createPayment(paymentData) {
        try {
            const response = await api.post('/payments/momo/create', paymentData);
            return response.data;
        } catch (error) {
            console.error('Error creating MoMo payment:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra trạng thái thanh toán MoMo
     * @param {string} orderId - ID đơn hàng
     * @returns {Promise<Object>} - Trạng thái thanh toán
     */
    static async checkPaymentStatus(orderId) {
        try {
            const response = await api.get(`/payments/momo/status/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking MoMo payment status:', error);
            throw error;
        }
    }

    /**
     * Test thanh toán MoMo (không cần authentication)
     * @param {Object} testData - Dữ liệu test
     * @returns {Promise<Object>} - Kết quả test
     */
    static async testPayment(testData) {
        try {
            const response = await api.post('/payments/momo/test', testData);
            return response.data;
        } catch (error) {
            console.error('Error testing MoMo payment:', error);
            throw error;
        }
    }

    /**
     * Test thanh toán MoMo trực tiếp (không cần authentication)
     * @param {Object} testData - Dữ liệu test
     * @returns {Promise<Object>} - Kết quả test
     */
    static async testDirectPayment(testData) {
        try {
            const response = await api.post('/payments/momo/test-direct', testData);
            return response.data;
        } catch (error) {
            console.error('Error testing direct MoMo payment:', error);
            throw error;
        }
    }

    /**
     * Mở MoMo app để thanh toán
     * @param {string} payUrl - URL thanh toán từ MoMo
     */
    static openMomoApp(payUrl) {
        if (payUrl) {
            window.open(payUrl, '_blank');
        }
    }

    /**
     * Mở deep link MoMo
     * @param {string} deeplink - Deep link MoMo
     */
    static openMomoDeepLink(deeplink) {
        if (deeplink) {
            window.location.href = deeplink;
        }
    }

    /**
     * Tạo QR code URL cho MoMo
     * @param {string} qrCodeUrl - URL QR code từ MoMo
     * @returns {string} - URL QR code
     */
    static getQRCodeUrl(qrCodeUrl) {
        return qrCodeUrl || '';
    }

    /**
     * Chuyển hướng đến trang thanh toán MoMo
     * @param {string} payUrl - URL thanh toán từ MoMo
     */
    static redirectToPayment(payUrl) {
        if (payUrl) {
            window.location.href = payUrl;
        } else {
            throw new Error('URL thanh toán không hợp lệ');
        }
    }

    /**
     * Mở thanh toán MoMo trong popup
     * @param {string} payUrl - URL thanh toán từ MoMo
     * @returns {Promise<Object>} - Promise resolve khi thanh toán hoàn tất
     */
    static openPaymentPopup(payUrl) {
        return new Promise((resolve, reject) => {
            if (!payUrl) {
                reject(new Error('URL thanh toán không hợp lệ'));
                return;
            }

            const popup = window.open(
                payUrl,
                'MoMoPayment',
                'width=500,height=600,scrollbars=yes,resizable=yes'
            );

            if (!popup) {
                reject(new Error('Không thể mở popup thanh toán. Vui lòng cho phép popup.'));
                return;
            }

            // Kiểm tra khi popup đóng
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    resolve({ status: 'popup_closed' });
                }
            }, 1000);

            // Timeout sau 30 phút
            setTimeout(() => {
                clearInterval(checkClosed);
                if (!popup.closed) {
                    popup.close();
                }
                reject(new Error('Thanh toán quá thời gian. Vui lòng thử lại.'));
            }, 30 * 60 * 1000);
        });
    }

    /**
     * Xử lý callback từ MoMo (được gọi từ trang callback)
     * @param {Object} callbackData - Dữ liệu callback
     * @returns {Object} - Kết quả xử lý
     */
    static handleCallback(callbackData) {
        try {
            // Lưu thông tin callback vào localStorage để frontend có thể đọc
            localStorage.setItem('momo_callback', JSON.stringify(callbackData));

            return {
                success: true,
                message: 'Xử lý callback thành công',
                data: callbackData,
            };
        } catch (error) {
            console.error('Error handling MoMo callback:', error);
            return {
                success: false,
                message: 'Lỗi xử lý callback',
                error: error.message,
            };
        }
    }

    /**
     * Lấy thông tin callback từ localStorage
     * @returns {Object|null} - Thông tin callback hoặc null
     */
    static getCallbackData() {
        try {
            const callbackData = localStorage.getItem('momo_callback');
            if (callbackData) {
                const data = JSON.parse(callbackData);
                localStorage.removeItem('momo_callback'); // Xóa sau khi đọc
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error getting callback data:', error);
            return null;
        }
    }

    /**
     * Format số tiền theo định dạng VND
     * @param {number} amount - Số tiền
     * @returns {string} - Số tiền đã format
     */
    static formatAmount(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    }

    /**
     * Tạo deep link cho thanh toán MoMo
     * @param {string} deeplink - Deep link từ MoMo
     * @returns {string} - Deep link
     */
    static getDeepLink(deeplink) {
        return deeplink || '';
    }
}

export default MomoService; 