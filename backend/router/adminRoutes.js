const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const sequelize = require("../config/database");
const initModels = require("../models/init-models");
const models = initModels(sequelize);
const router = express.Router();

/**
 * Router quản lý các API admin dashboard
 */

// Middleware kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            status: "error",
            message: "Quyền bị từ chối. Chỉ admin mới được thực hiện hành động này."
        });
    }
    next();
};

// Lấy thống kê tổng quan dashboard
router.get("/dashboard/stats", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { Op } = require("sequelize");

        // Đếm tổng số người dùng
        const totalUsers = await models.user.count();

        // Đếm tổng số bài viết
        const totalPosts = await models.communitypost.count();

        // Đếm tổng số giao dịch
        const totalTransactions = await models.payment.count();

        // Đếm tổng số bài học (grammar + vocabulary + skills)
        const totalGrammar = await models.lesson.count({
            where: { lesson_type: 'grammar' }
        });
        const totalVocabulary = await models.lesson.count({
            where: { lesson_type: 'vocabulary' }
        });
        const totalSkills = await models.skilllesson.count();
        const totalLessons = totalGrammar + totalVocabulary + totalSkills;

        // Thống kê người dùng theo role
        const userStats = await models.user.findAll({
            attributes: [
                'role',
                [sequelize.fn('COUNT', sequelize.col('user_id')), 'count']
            ],
            group: ['role']
        });

        // Thống kê giao dịch theo trạng thái
        const transactionStats = await models.payment.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('payment_id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
            ],
            group: ['status']
        });

        // Thống kê giao dịch theo thời gian (7 ngày gần nhất)
        const transactionTimeline = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayTransactions = await models.payment.count({
                where: {
                    paid_at: {
                        [Op.gte]: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                        [Op.lt]: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
                    }
                }
            });

            const dayRevenue = await models.payment.sum('amount', {
                where: {
                    status: 'success',
                    paid_at: {
                        [Op.gte]: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                        [Op.lt]: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
                    }
                }
            });

            transactionTimeline.push({
                date: dateStr,
                transactions: dayTransactions,
                revenue: dayRevenue || 0
            });
        }

        // Thống kê bài học theo loại
        const lessonStats = [
            { type: 'grammar', count: totalGrammar },
            { type: 'vocabulary', count: totalVocabulary },
            { type: 'skills', count: totalSkills }
        ];

        // Người dùng mới trong 7 ngày qua
        const recentUsers = await models.user.count({
            where: {
                created_at: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });

        // Giao dịch thành công trong 7 ngày qua
        const recentTransactions = await models.payment.count({
            where: {
                status: 'success',
                paid_at: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });

        return res.status(200).json({
            status: "success",
            data: {
                totalUsers,
                totalPosts,
                totalTransactions,
                totalLessons,
                userStats,
                transactionStats,
                transactionTimeline,
                lessonStats,
                recentUsers,
                recentTransactions
            },
            message: "Lấy thống kê dashboard thành công"
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in GET /admin/dashboard/stats: ${error.message}`);
        return res.status(500).json({
            status: "error",
            message: "Lỗi server khi lấy thống kê dashboard"
        });
    }
});

// Lấy thống kê người dùng
router.get("/dashboard/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { Op } = require("sequelize");

        // Tổng số người dùng
        const totalUsers = await models.user.count();

        // Số admin
        const adminCount = await models.user.count({
            where: { role: 'admin' }
        });

        // Số học sinh
        const studentCount = await models.user.count({
            where: { role: 'student' }
        });

        // Người dùng mới trong 7 ngày qua
        const recentUsers = await models.user.findAll({
            where: {
                created_at: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            },
            order: [['created_at', 'DESC']],
            limit: 10,
            attributes: ['user_id', 'username', 'email', 'role', 'created_at']
        });

        return res.status(200).json({
            status: "success",
            data: {
                totalUsers,
                adminCount,
                studentCount,
                activeUsers: totalUsers, // Tạm thời coi tất cả là active
                recentUsers
            },
            message: "Lấy thống kê người dùng thành công"
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in GET /admin/dashboard/users: ${error.message}`);
        return res.status(500).json({
            status: "error",
            message: "Lỗi server khi lấy thống kê người dùng"
        });
    }
});

// Lấy thống kê bài học
router.get("/dashboard/lessons", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { Op } = require("sequelize");

        // Tổng số bài học ngữ pháp
        const totalGrammar = await models.lesson.count({
            where: { lesson_type: 'grammar' }
        });

        // Tổng số bài học từ vựng
        const totalVocabulary = await models.lesson.count({
            where: { lesson_type: 'vocabulary' }
        });

        // Tổng số bài học kỹ năng
        const totalSkills = await models.skilllesson.count();

        // Tổng số bài học
        const totalLessons = totalGrammar + totalVocabulary + totalSkills;

        // Thống kê theo loại bài học
        const lessonStats = [
            { type: 'grammar', count: totalGrammar },
            { type: 'vocabulary', count: totalVocabulary },
            { type: 'skills', count: totalSkills }
        ];

        return res.status(200).json({
            status: "success",
            data: {
                totalLessons,
                totalGrammar,
                totalVocabulary,
                totalSkills,
                lessonStats
            },
            message: "Lấy thống kê bài học thành công"
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in GET /admin/dashboard/lessons: ${error.message}`);
        return res.status(500).json({
            status: "error",
            message: "Lỗi server khi lấy thống kê bài học"
        });
    }
});

// Lấy thống kê giao dịch
router.get("/dashboard/transactions", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { Op } = require("sequelize");

        // Tổng số giao dịch
        const totalTransactions = await models.payment.count();

        // Tổng doanh thu
        const totalRevenue = await models.payment.sum('amount', {
            where: { status: 'success' }
        });

        // Giao dịch thành công
        const completedTransactions = await models.payment.count({
            where: { status: 'success' }
        });

        // Giao dịch thất bại
        const failedTransactions = await models.payment.count({
            where: { status: 'failed' }
        });

        // Giao dịch trong 7 ngày qua
        const recentTransactions = await models.payment.count({
            where: {
                paid_at: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });

        // Doanh thu trong 7 ngày qua
        const recentRevenue = await models.payment.sum('amount', {
            where: {
                status: 'success',
                paid_at: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });

        return res.status(200).json({
            status: "success",
            data: {
                totalTransactions,
                totalRevenue: totalRevenue || 0,
                completedTransactions,
                pendingTransactions: 0, // Không có status pending
                failedTransactions,
                recentTransactions,
                recentRevenue: recentRevenue || 0
            },
            message: "Lấy thống kê giao dịch thành công"
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in GET /admin/dashboard/transactions: ${error.message}`);
        return res.status(500).json({
            status: "error",
            message: "Lỗi server khi lấy thống kê giao dịch"
        });
    }
});

module.exports = router; 