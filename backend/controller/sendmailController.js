const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Xác thực tài khoản - Website học tiếng Anh',
    html: `
      <p>Xin chào,</p>
      <p>Mã xác thực của bạn là: <strong>${otp}</strong></p>
      <p>Mã có hiệu lực trong ${process.env.OTP_EXPIRE_MINUTES} phút.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOtpEmail,
};
