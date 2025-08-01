const crypto = require('crypto');
require('dotenv').config();

// Cấu hình MoMo - Sử dụng biến môi trường
const MOMO_CONFIG = {
    // Thông tin đối tác từ .env
    partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
    accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
    secretKey: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",

    // URLs - Test environment
    baseUrl: process.env.MOMO_BASE_URL || "https://test-payment.momo.vn",
    createPaymentUrl: "/v2/gateway/api/create",

    // Cấu hình khác
    requestType: "captureWallet",
    lang: "en",

    // Callback URLs từ .env
    redirectUrl: process.env.MOMO_REDIRECT_URL || "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8",
    ipnUrl: process.env.MOMO_IPN_URL || "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8",
};

/**
 * Tạo chữ ký HMAC SHA256 cho MoMo theo format chính xác
 * @param {Object} params - Các tham số cần ký
 * @returns {string} - Chữ ký
 */
function createSignature(params) {
    // Loại bỏ signature và lang nếu có trong params
    const { signature, lang, ...paramsToSign } = params;

    // Sắp xếp các key theo thứ tự alphabet
    const sortedKeys = Object.keys(paramsToSign).sort();

    // Tạo raw signature string theo format: key1=value1&key2=value2&...
    const rawSignature = sortedKeys
        .map(key => `${key}=${paramsToSign[key]}`)
        .join('&');

    console.log('--------------------RAW SIGNATURE----------------');
    console.log(rawSignature);

    // Tạo HMAC SHA256
    const signatureResult = crypto.createHmac('sha256', MOMO_CONFIG.secretKey)
        .update(rawSignature)
        .digest('hex');

    console.log('--------------------SIGNATURE----------------');
    console.log(signatureResult);

    return signatureResult;
}

/**
 * Tạo request body cho MoMo theo format chính xác
 * @param {Object} paymentData - Dữ liệu thanh toán
 * @returns {Object} - Request body
 */
function createMomoRequest(paymentData) {
    const {
        orderId,
        amount,
        orderInfo,
        requestId,
        extraData = ""
    } = paymentData;

    // Đảm bảo amount là số nguyên
    const amountInt = Math.round(parseFloat(amount));

    // Tạo request params theo đúng thứ tự và format như code mẫu
    const requestParams = {
        accessKey: MOMO_CONFIG.accessKey,
        amount: amountInt,
        extraData: extraData,
        ipnUrl: MOMO_CONFIG.ipnUrl,
        orderId: orderId,
        orderInfo: orderInfo,
        partnerCode: MOMO_CONFIG.partnerCode,
        redirectUrl: MOMO_CONFIG.redirectUrl,
        requestId: requestId,
        requestType: MOMO_CONFIG.requestType,
    };

    console.log('Request params before signature:', requestParams);

    const signature = createSignature(requestParams);

    // Tạo final request theo đúng format JSON như code mẫu
    const finalRequest = {
        partnerCode: MOMO_CONFIG.partnerCode,
        accessKey: MOMO_CONFIG.accessKey,
        requestId: requestId,
        amount: amountInt,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: MOMO_CONFIG.redirectUrl,
        ipnUrl: MOMO_CONFIG.ipnUrl,
        extraData: extraData,
        requestType: MOMO_CONFIG.requestType,
        signature: signature,
        lang: MOMO_CONFIG.lang,
    };

    console.log('Final MoMo request:', JSON.stringify(finalRequest, null, 2));

    return finalRequest;
}

/**
 * Xác thực chữ ký từ MoMo callback
 * @param {Object} callbackData - Dữ liệu callback từ MoMo
 * @returns {boolean} - True nếu chữ ký hợp lệ
 */
function verifyMomoSignature(callbackData) {
    const { signature, ...params } = callbackData;
    const expectedSignature = createSignature(params);
    console.log('Expected signature:', expectedSignature);
    console.log('Received signature:', signature);
    return signature === expectedSignature;
}

module.exports = {
    MOMO_CONFIG,
    createMomoRequest,
    verifyMomoSignature,
    createSignature,
}; 