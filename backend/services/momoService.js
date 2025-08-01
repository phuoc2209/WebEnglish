const axios = require('axios');
const { MOMO_CONFIG, createMomoRequest, verifyMomoSignature } = require('../config/momoConfig');

class MomoService {
    static async createPayment(paymentData) {
        try {
            console.log('Creating MoMo payment with data:', JSON.stringify(paymentData, null, 2));

            if (!paymentData.orderId || !paymentData.amount || !paymentData.orderInfo || !paymentData.requestId) {
                throw new Error('Thiếu thông tin bắt buộc cho thanh toán MoMo');
            }
            
            // Đảm bảo amount là số nguyên
            const amount = Math.round(parseFloat(paymentData.amount));
            if (amount < 1000) {
                throw new Error('Số tiền tối thiểu là 1,000 VND');
            }
            if (amount > 20000000) {
                throw new Error('Số tiền tối đa là 20,000,000 VND');
            }
            
            if (paymentData.orderId.length > 50) {
                throw new Error('Order ID quá dài (tối đa 50 ký tự)');
            }
            if (paymentData.requestId.length > 50) {
                throw new Error('Request ID quá dài (tối đa 50 ký tự)');
            }

            // Cập nhật paymentData với amount đã được xử lý
            const processedPaymentData = {
                ...paymentData,
                amount: amount
            };

            const requestBody = createMomoRequest(processedPaymentData);

            console.log('MoMo request body:', JSON.stringify(requestBody, null, 2));

            const response = await axios.post(
                `${MOMO_CONFIG.baseUrl}${MOMO_CONFIG.createPaymentUrl}`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    timeout: 60000,
                }
            );

            console.log('MoMo response status:', response.status);
            console.log('MoMo response data:', JSON.stringify(response.data, null, 2));

            if (response.data.resultCode === 0) {
                return {
                    success: true,
                    data: {
                        payUrl: response.data.payUrl,
                        deeplink: response.data.deeplink,
                        qrCodeUrl: response.data.qrCodeUrl,
                        applink: response.data.applink,
                        orderId: paymentData.orderId,
                        requestId: paymentData.requestId,
                        transId: response.data.transId,
                        amount: amount,
                        orderInfo: paymentData.orderInfo,
                    },
                    message: 'Tạo thanh toán MoMo thành công',
                };
            } else {
                console.error('MoMo API error:', response.data);
                return {
                    success: false,
                    error: response.data.message || `Lỗi MoMo: ${response.data.resultCode}`,
                    resultCode: response.data.resultCode,
                };
            }
        } catch (error) {
            console.error('Error creating MoMo payment:', error);
            if (error.response) {
                console.error('MoMo server error:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers,
                });
                return {
                    success: false,
                    error: error.response.data?.message || `Lỗi server MoMo: ${error.response.status}`,
                    resultCode: error.response.data?.resultCode,
                };
            } else if (error.request) {
                console.error('MoMo request error:', error.request);
                return {
                    success: false,
                    error: 'Không thể kết nối với MoMo. Vui lòng thử lại sau.',
                };
            } else {
                console.error('MoMo other error:', error.message);
                return {
                    success: false,
                    error: `Lỗi hệ thống: ${error.message}`,
                };
            }
        }
    }

    static processCallback(callbackData) {
        try {
            console.log('Processing MoMo callback:', JSON.stringify(callbackData, null, 2));

            const isValidSignature = verifyMomoSignature(callbackData);
            if (!isValidSignature) {
                console.error('Invalid MoMo signature');
                return {
                    success: false,
                    error: 'Chữ ký không hợp lệ',
                };
            }

            if (callbackData.resultCode !== 0) {
                console.error('MoMo payment failed:', callbackData.message);
                return {
                    success: false,
                    error: callbackData.message || 'Thanh toán thất bại',
                    resultCode: callbackData.resultCode,
                };
            }

            return {
                success: true,
                data: {
                    orderId: callbackData.orderId,
                    requestId: callbackData.requestId,
                    transId: callbackData.transId,
                    amount: callbackData.amount,
                    orderInfo: callbackData.orderInfo,
                    orderType: callbackData.orderType,
                    payType: callbackData.payType,
                    responseTime: callbackData.responseTime,
                },
                message: 'Xử lý callback thành công',
            };
        } catch (error) {
            console.error('Error processing MoMo callback:', error);
            return {
                success: false,
                error: `Lỗi xử lý callback: ${error.message}`,
            };
        }
    }

    static async checkPaymentStatus(orderId) {
        try {
            console.log('Checking MoMo payment status for orderId:', orderId);

            if (!orderId) {
                throw new Error('Order ID không được để trống');
            }

            const requestId = `CHECK_${Date.now()}`;
            const requestParams = {
                accessKey: MOMO_CONFIG.accessKey,
                orderId,
                partnerCode: MOMO_CONFIG.partnerCode,
                requestId,
            };

            const { createSignature } = require('../config/momoConfig');
            const signature = createSignature(requestParams);

            const requestBody = {
                ...requestParams,
                signature,
                lang: MOMO_CONFIG.lang,
            };

            console.log('Status check request:', JSON.stringify(requestBody, null, 2));

            const response = await axios.post(
                `${MOMO_CONFIG.baseUrl}/v2/gateway/api/query`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 60000,
                }
            );

            console.log('Status check response:', JSON.stringify(response.data, null, 2));

            if (response.data.resultCode === 0) {
                return {
                    success: true,
                    data: response.data,
                    message: 'Kiểm tra trạng thái thành công',
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || `Lỗi kiểm tra trạng thái: ${response.data.resultCode}`,
                    resultCode: response.data.resultCode,
                };
            }
        } catch (error) {
            console.error('Error checking MoMo payment status:', error);
            return {
                success: false,
                error: `Lỗi kiểm tra trạng thái: ${error.message}`,
            };
        }
    }

    static generateRequestId() {
        return `${MOMO_CONFIG.partnerCode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    static generateOrderId(userId, packageId) {
        return `ORDER_${userId}_${packageId}_${Date.now()}`;
    }
}

module.exports = MomoService;
