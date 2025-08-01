const express = require('express');
const authRoutes = require("./router/authRoutes");
const userRoutes = require("./router/UserRouter");
const lessonRoutes = require("./router/lessonRouter");
const gameRoutes = require("./router/gameRouter");
const testRoutes = require("./router/testRoutes");
const learningProgressRoutes = require("./router/learningProgressRoutes");
const learningPathRoutes = require("./router/learningPathRoutes");
const communityRoutes = require("./router/communityRoutes");
const strengthWeaknessRoutes = require("./router/strengthWeaknessRoutes");
const skillRoutes = require("./router/skillRoutes");
const uploadRoutes = require("./router/uploadRoutes");
const aiGradingRoutes = require('./router/aiGradingRoutes');
const adminRoutes = require('./router/adminRoutes');
const aiRoutes = require('./router/aiRoutes');
const sendMail = require('./router/sendmailRouter');
require('dotenv').config();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const sequelize = require('./config/database');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(fileUpload()); // ĐÃ XÓA để tránh xung đột với multer
app.use(cors({
  origin: 'http://localhost:5173', // Origin của Vite frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức HTTP được phép
  credentials: true // Nếu bạn gửi cookie hoặc header xác thực
}));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/learning-progress", learningProgressRoutes);
app.use("/api/learning-paths", learningPathRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/strength-weakness", strengthWeaknessRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/upload", uploadRoutes);
app.use('/api/ai', aiGradingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai-tools', aiRoutes);
app.use('/api/sendmail', sendMail);


// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Có lỗi xảy ra, vui lòng thử lại' });
});

// Đăng ký pool vào request
app.use((req, res, next) => {
  req.db = sequelize;
  next();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});